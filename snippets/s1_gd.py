import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 3))                  # 200 samples, 3 features
y = X @ np.array([2.0, -1.0, 0.5]) + 0.3 + 0.1 * rng.normal(size=200)

w, b, lr = np.zeros(3), 0.0, 0.1
for step in range(500):
    err = X @ w + b - y                        # prediction error
    loss = (err ** 2).mean()                   # mean squared error
    w -= lr * 2 * X.T @ err / len(y)           # dL/dw, derived by hand
    b -= lr * 2 * err.mean()                   # dL/db
    if step % 100 == 0:
        print(f"step {step:3d}  loss {loss:.4f}")

# sanity check against the closed-form least-squares answer
A = np.c_[X, np.ones(len(y))]
print("gradient descent:", np.round(np.r_[w, b], 3))
print("least squares   :", np.round(np.linalg.lstsq(A, y, rcond=None)[0], 3))
