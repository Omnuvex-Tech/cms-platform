"use client";

/**
 * Yüklənmə spinneri — konik keçiddən maskalanmış nazik qövs, düşdüyü
 * çərçivənin mərkəzində fırlanır. treva-web-dəki şəkil/media yüklənmə
 * spinneri ilə eyni görkəm, yalnız panelin göy rəngində.
 *
 * `block` — səhifə boyu yüklənmə vəziyyəti üçün (mərkəzləşmiş, hündür sahə).
 * `label` boş verilsə yalnız qövs görünür (düymə/sətiriçi istifadə üçün).
 */
export function Spinner({
    label = "Yüklənir",
    size = 44,
    block = false,
}: {
    label?: string;
    size?: number;
    block?: boolean;
}) {
    return (
        <div className={block ? "spinnerBlock" : "spinnerInline"} role="status" aria-live="polite">
            <span className="spinnerArc" style={{ width: size, height: size }} aria-hidden="true" />
            {label ? <span className="spinnerLabel">{label}</span> : <span className="srOnly">Yüklənir</span>}

            <style jsx>{`
                .spinnerBlock {
                    display: grid;
                    place-items: center;
                    gap: 14px;
                    min-height: 260px;
                    padding: 48px 0;
                }
                .spinnerInline {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }
                .spinnerArc {
                    display: block;
                    border-radius: 50%;
                    background: conic-gradient(
                        from 0deg,
                        rgba(1, 72, 194, 0) 0%,
                        rgba(1, 72, 194, 0.55) 100%
                    );
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
                    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
                    animation: spinnerRotate 0.9s linear infinite;
                }
                .spinnerLabel {
                    font-size: 13px;
                    color: var(--text-faint, #9aa2b1);
                    letter-spacing: 0.01em;
                }
                .srOnly {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
                @keyframes spinnerRotate {
                    to {
                        transform: rotate(1turn);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .spinnerArc {
                        animation-duration: 2.4s;
                    }
                }
            `}</style>
        </div>
    );
}
