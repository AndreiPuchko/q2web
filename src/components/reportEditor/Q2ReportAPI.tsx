import JSZip from "jszip";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


async function waitForCompletion(task_id: string) {
    const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
    const ws = new WebSocket(`${wsProtocol}://${new URL(API_BASE).host}/ws/${task_id}`);

    let isDone = false;
    let intervalId: number | undefined;

    const stopPolling = () => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
    };

    const progressPromise = new Promise<void>((resolve, reject) => {
        ws.onmessage = (event) => {
            const msg = event.data;
            console.log("Progress (WS):", msg);
            if (msg === "done") {
                isDone = true;
                stopPolling(); // ✅ stop polling if WS wins
                ws.close();
                resolve();
            }
        };
        ws.onerror = (e) => {
            console.warn("WebSocket error:", e);
            reject(e);
        };
        ws.onclose = () => {
            if (!isDone) console.log("WebSocket closed before done");
        };
    });

    const pollPromise = new Promise<void>((resolve, reject) => {
        intervalId = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status/${task_id}`);
                const data = await res.json();
                if (data.status === "done") {
                    console.log("Progress (poll): done");
                    stopPolling(); // ✅ safe cleanup
                    if (ws.readyState === WebSocket.OPEN) ws.close();
                    resolve();
                }
            } catch (err) {
                console.warn("Polling error:", err);
                stopPolling();
                reject(err);
            }
        }, 1000);
    });

    // Return whichever resolves first
    await Promise.race([progressPromise, pollPromise]);
}


async function uploadAndDownload(report: any, data_set: any, format: string) {

    // console.log(JSON.stringify(report, null, 2));
    const zip = new JSZip();

    zip.file("report.json", JSON.stringify(report.report, null, 2));
    zip.file("data.json", JSON.stringify(data_set, null, 2));

    const blob = await zip.generateAsync({ type: "blob" });

    // 1. Upload ZIP file
    const formData = new FormData();
    formData.append("file", blob, "report.zip");
    formData.append("format", format);

    const uploadResp = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: formData
    });

    const { task_id, error } = await uploadResp.json();
    if (error) {
        console.error("Upload error:", error);
        return;
    }

    console.log("Task started:", task_id);

    // 2. Connect to WebSocket for progress

    await waitForCompletion(task_id);


    // 4. Download result
    const downloadResp = await fetch(`${API_BASE}/download/${task_id}`);
    const blobResult = await downloadResp.blob();

    const url = window.URL.createObjectURL(blobResult);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    console.log("Download completed");
}

export default uploadAndDownload