import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(0)
X = torch.rand(2000, 2) * 4 - 2                # swap in your own measurements here
y = torch.sin(2 * X[:, :1]) + X[:, 1:] ** 2 + 0.05 * torch.randn(2000, 1)
train_ds, val_ds = random_split(TensorDataset(X, y), [1600, 400])
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=400)

model = nn.Sequential(nn.Linear(2, 64), nn.ReLU(), nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 1))
opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
loss_fn = nn.MSELoss()

yv = torch.cat([yb for _, yb in val_dl])
print(f"baseline (always predict the mean): {((yv - yv.mean()) ** 2).mean():.4f}")
best = float("inf")
for epoch in range(30):
    model.train()
    for xb, yb in train_dl:
        loss = loss_fn(model(xb), yb)
        opt.zero_grad()
        loss.backward()                        # autograd does the calculus
        opt.step()
    model.eval()
    with torch.no_grad():
        val = sum(loss_fn(model(xb), yb).item() * len(xb) for xb, yb in val_dl) / len(val_ds)
    if val < best:                             # keep the best checkpoint, not the last
        best = val
        torch.save(model.state_dict(), "best.pt")
    if epoch % 5 == 0:
        print(f"epoch {epoch:2d}  val_mse {val:.4f}")
print(f"best val_mse {best:.4f}")
