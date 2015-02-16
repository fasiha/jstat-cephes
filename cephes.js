var cephes = {
    polevl :
        function(x, coef, N) {
            var ans, i, coefidx;
            ans = coef[0];
            i = N;
            coefidx = 1;
            do {
                ans = ans * x + coef[coefidx];
                coefidx++;
            } while (--i);
            return (ans);
        },

    p1evl :
        function(x, coef, N) {
            var ans, i, coefidx;
            ans = x + coef[0];
            i = N - 1;
            coefidx = 1;
            do {
                ans = ans * x + coef[coefidx];
                coefidx++;
            } while (--i);
            return (ans);
        },

    big : 4.503599627370496e15,
    biginv : 2.22044604925031308085e-16,
    MAXLOG : 7.09782712893383996843E2,
    MACHEP : 1.11022302462515654042E-16,
    MINLOG : -7.08396418532264106224E2,
    MAXNUM : 1.7976931348623158E308,
    P : [
          1.60119522476751861407E-4,
          1.19135147006586384913E-3,
          1.04213797561761569935E-2,
          4.76367800457137231464E-2,
          2.07448227648435975150E-1,
          4.94214826801497100753E-1,
          9.99999999999999996796E-1
        ],
    Q : [
          -2.31581873324120129819E-5,
          5.39605580493303397842E-4,
          -4.45641913851797240494E-3,
          1.18139785222060435552E-2,
          3.58236398605498653373E-2,
          -2.34591795718243348568E-1,
          7.14304917030273074085E-2,
          1.00000000000000000320E0
        ],
    MAXGAM : 171.624376956302725,
    LOGPI : 1.14472988584940017414,
    STIR : [
             7.87311395793093628397E-4,
             -2.29549961613378126380E-4,
             -2.68132617805781232825E-3,
             3.47222221605458667310E-3,
             8.33333333333482257126E-2,
           ],
    MAXSTIR : 143.01608,
    SQTPI : 2.50662827463100050242E0,

    stirf :
        function(x) {
            var y, w, v;
            w = 1.0 / x;
            w = 1.0 + w * this.polevl(w, this.STIR, 4);
            y = Math.exp(x);
            if (x > this.MAXSTIR) {/* Avoid overflow in pow() */
                v = Math.pow(x, 0.5 * x - 0.25);
                y = v * (v / y);
            } else {
                y = Math.pow(x, x - 0.5) / y;
            }
            y = this.SQTPI * y * w;
            return (y);
        },

    gamma :
        function(x) {
            function gammasmall(x, z) {
                if (x == 0.0) {
                    return (NaN);
                } else
                    return (z / ((1.0 + 0.5772156649015329 * x) * x));
            }

            var p, q, z, i, sgngam;
            sgngam = 1;
            if (isNaN(x)) return (x);
            if (x === Infinity) return (x);
            if (x === -Infinity) return (NaN);
            q = Math.abs(x);
            if (q > 33.0) {
                if (x < 0.0) {
                    p = floor(q);
                    if (p == q) {
                        return (NaN);
                    }
                    i = p;
                    if ((i & 1) == 0) sgngam = -1;
                    z = q - p;
                    if (z > 0.5) {
                        p += 1.0;
                        z = q - p;
                    }
                    z = q * Math.sin(Math.PI * z);
                    if (z == 0.0) {
                        return (sgngam * Infinity);
                    }
                    z = Math.abs(z);
                    z = PI / (z * this.stirf(q));
                } else {
                    z = this.stirf(x);
                }
                return (sgngam * z);
            }
            z = 1.0;
            while (x >= 3.0) {
                x -= 1.0;
                z *= x;
            }
            while (x < 0.0) {
                if (x > -1.E-9) return gammasmall(x, z);
                z /= x;
                x += 1.0;
            }
            while (x < 2.0) {
                if (x < 1.e-9) return gammasmall(x, z);
                z /= x;
                x += 1.0;
            }
            if (x == 2.0) return (z);
            x -= 2.0;
            p = this.polevl(x, this.P, 6);
            q = this.polevl(x, this.Q, 7);
            return (z * p / q);
        },

    A : [
          8.11614167470508450300E-4,
          -5.95061904284301438324E-4,
          7.93650340457716943945E-4,
          -2.77777777730099687205E-3,
          8.33333333333331927722E-2
        ],
    B : [
          -1.37825152569120859100E3,
          -3.88016315134637840924E4,
          -3.31612992738871184744E5,
          -1.16237097492762307383E6,
          -1.72173700820839662146E6,
          -8.53555664245765465627E5
        ],
    C : [
          /* 1.00000000000000000000E0, */
          -3.51815701436523470549E2,
          -1.70642106651881159223E4,
          -2.20528590553854454839E5,
          -1.13933444367982507207E6,
          -2.53252307177582951285E6,
          -2.01889141433532773231E6
        ],
        /* log( sqrt( 2*pi ) ) */
    LS2PI : 0.91893853320467274178,
    MAXLGM : 2.556348e305,

    lgam :
        function(x) {
            var p, q, u, w, z;
            var i;
            var sgngam = 1;
            if (isNaN(x)) return (x);

            if (!isFinite(x)) return (Infinity);

            if (x < -34.0) {
                q = -x;
                w = this.lgam(q); /* note this modifies sgngam! */
                p = Math.floor(q);
                if (p == q) {
                    return (Infinity);
                }
                i = p;
                if ((i & 1) == 0)
                    sgngam = -1;
                else
                    sgngam = 1;
                z = q - p;
                if (z > 0.5) {
                    p += 1.0;
                    z = p - q;
                }
                z = q * Math.sin(PI * z);
                if (z == 0.0) return Infinity;
                /*  z = log(PI) - log( z ) - w;*/
                z = this.LOGPI - Math.log(z) - w;
                return (z);
            }

            if (x < 13.0) {
                z = 1.0;
                p = 0.0;
                u = x;
                while (u >= 3.0) {
                    p -= 1.0;
                    u = x + p;
                    z *= u;
                }
                while (u < 2.0) {
                    if (u == 0.0) return (Infinity);
                    ;
                    z /= u;
                    p += 1.0;
                    u = x + p;
                }
                if (z < 0.0) {
                    sgngam = -1;
                    z = -z;
                } else
                    sgngam = 1;
                if (u == 2.0) return (Math.log(z));
                p -= 2.0;
                x = x + p;
                p = x * this.polevl(x, this.B, 5) / this.p1evl(x, this.C, 6);
                return (Math.log(z) + p);
            }

            if (x > this.MAXLGM) {
                return (sgngam * Infinity);
            }

            q = (x - 0.5) * Math.log(x) - x + this.LS2PI;
            if (x > 1.0e8) return (q);

            p = 1.0 / (x * x);
            if (x >= 1000.0)
                q += ((7.9365079365079365079365e-4 * p -
                       2.7777777777777777777778e-3) *
                          p +
                      0.0833333333333333333333) /
                     x;
            else
                q += this.polevl(p, this.A, 4) / x;
            return (q);
        },

    igamc :
        function(a, x) {
            var ans, ax, c, yc, r, t, y, z;
            var pk, pkm1, pkm2, qk, qkm1, qkm2;
            if ((x <= 0) || (a <= 0)) return (1.0);
            if ((x < 1.0) || (x < a)) return (1.0 - this.igam(a, x));
            ax = a * Math.log(x) - x - this.lgam(a);
            if (ax < -this.MAXLOG) {
                return NaN;
            }
            ax = Math.exp(ax);
            /* continued fraction */
            y = 1.0 - a;
            z = x + y + 1.0;
            c = 0.0;
            pkm2 = 1.0;
            qkm2 = x;
            pkm1 = x + 1.0;
            qkm1 = z * x;
            ans = pkm1 / qkm1;
            do {
                c += 1.0;
                y += 1.0;
                z += 2.0;
                yc = y * c;
                pk = pkm1 * z - pkm2 * yc;
                qk = qkm1 * z - qkm2 * yc;
                if (qk != 0) {
                    r = pk / qk;
                    t = Math.abs((ans - r) / r);
                    ans = r;
                } else
                    t = 1.0;
                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;
                if (Math.abs(pk) > this.big) {
                    pkm2 *= this.biginv;
                    pkm1 *= this.biginv;
                    qkm2 *= this.biginv;
                    qkm1 *= this.biginv;
                }
            } while (t > this.MACHEP);
            return (ans * ax);
        },

    igam :
        function(a, x) {
            var ans, ax, c, r;
            if ((x <= 0) || (a <= 0)) return (0.0);
            if ((x > 1.0) && (x > a)) return (1.0 - this.igamc(a, x));
            /* Compute x**a * exp(-x) / this.gamma(a) */
            ax = a * Math.log(x) - x - this.lgam(a);
            if (ax < -this.MAXLOG) {
                return NaN;
            }
            ax = Math.exp(ax);
            /* power series */
            r = a;
            c = 1.0;
            ans = 1.0;
            do {
                r += 1.0;
                c *= x / r;
                ans += c;
            } while (c / ans > this.MACHEP);
            return (ans * ax / a);
        },
};