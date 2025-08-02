import os
import modal
from time import time
os.environ["MODAL_TOKEN_ID"] = "ak-m8R2h8ujVBTKDd1Nz1AGS4"
os.environ["MODAL_TOKEN_SECRET"] = "as-fUqQ4Avv6LcVtKYI1cKXcn"

def test_direct_call():
    print("Connecting to app")

    try:
        f = modal.Function.from_name("my-shared-app", "square")
        start = time()
        print(f.remote(42))
        end = time()
        print(f"Time taken: {end - start} seconds")
    except Exception as e:
        print(e)

test_direct_call()