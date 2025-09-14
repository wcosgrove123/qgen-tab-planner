
from __future__ import annotations
import math
from typing import Tuple

def z_test_two_props(x1: int, n1: int, x2: int, n2: int) -> Tuple[float, float]:
    """Return (z, p_approx) for a two-proportion z-test (pooled).
    p_approx is a normal-approx two-tailed p-value.
    """
    if min(n1, n2) == 0:
        return float('nan'), float('nan')
    p1 = x1 / n1
    p2 = x2 / n2
    p_pool = (x1 + x2) / (n1 + n2)
    se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
    if se == 0:
        return float('inf'), 0.0 if p1 != p2 else 1.0
    z = (p1 - p2) / se
    # Normal approx for two-tailed p:
    # p = 2 * (1 - Phi(|z|)) but we don't import scipy; approximate via error function
    # Phi(z) ~ 0.5*(1+erf(z/sqrt(2)))
    from math import erf, sqrt
    p = 2 * (1 - 0.5*(1 + erf(abs(z)/sqrt(2))))
    return z, p
