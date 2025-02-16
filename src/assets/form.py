def create_form():
    form = Q2Form("Layouts")
    form.add_control("/")  # close default form layout
    if form.add_control("/v", "Vertical layout"):
        form.add_control("var1", "Line input", datalen=15)
        form.add_control("var2", "Line input")

        if form.add_control("/h", "Horizontal layout"):
            form.add_control("var3", "Line input")
            form.add_control("var4", "Line input", stretch=2)  # stretch factor!
            form.add_control("/")  # close layout
        if form.add_control("/h", "Next horizontal layout"):
            if form.add_control("/f", "Form layout", stretch=4):
                form.add_control("var5", "Line input", datalen=10)
                form.add_control("var6", "Line input")
                form.add_control("/")
            if form.add_control("/f", "Next form layout", stretch=2):
                form.add_control("var7", "Line input")
                form.add_control("var8", "Line input")
                form.add_control("/")
            form.add_control("/")
        form.add_control("/")

    form.cancel_button = True
    return form
