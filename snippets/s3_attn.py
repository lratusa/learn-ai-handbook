import torch
import torch.nn.functional as F

torch.manual_seed(0)
B, T, C = 2, 8, 32                             # batch, sequence length, embedding size
x = torch.randn(B, T, C)
Wq, Wk, Wv = (torch.nn.Linear(C, C, bias=False) for _ in range(3))
q, k, v = Wq(x), Wk(x), Wv(x)

scores = q @ k.transpose(-2, -1) / C ** 0.5    # (B, T, T): how much each token attends to each other
causal = torch.tril(torch.ones(T, T, dtype=torch.bool))
scores = scores.masked_fill(~causal, float("-inf"))   # a token may not look at the future
out = F.softmax(scores, dim=-1) @ v            # (B, T, C): weighted mix of values

ref = F.scaled_dot_product_attention(q, k, v, is_causal=True)
print("matches PyTorch's built-in attention:", torch.allclose(out, ref, atol=1e-5))
