import modal

app = modal.App("my-shared-app")


@app.function()
def square(x: int):
    return x ** 2