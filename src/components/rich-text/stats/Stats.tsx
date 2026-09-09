interface Stat {
    id?: string;
    value: string;
    label: string;
}

/**
 * A row of headline figures, stepping 3 → 2 → 1 across the breakpoints rather
 * than dropping straight from three columns to one. Any count past three wraps
 * onto the next row.
 *
 * `items-start` keeps every cell hugging the top of its row: without it the
 * cells stretch to the tallest one and `flex-col-reverse` packs their contents
 * to the bottom, so a figure beside a two-line label would sit lower.
 *
 * Marked up as a description list because that is what it is — but the DOM
 * order is term-then-description (label, then figure) so a screen reader hears
 * "sign up drop off, 48%", while `flex-col-reverse` puts the figure on top
 * visually, as the design has it.
 */
export default function Stats({ stats }: { stats?: Stat[] }) {
    if (!stats?.length) return null;

    return (
        <dl className="grid grid-cols-1 items-start gap-4 s:grid-cols-2 md:grid-cols-3 md:gap-x-8">
            {stats.map((stat, index) => (
                <div
                    key={stat.id ?? index}
                    className="flex flex-col-reverse gap-3 py-4 md:py-5"
                >
                    <dt className="text-label text-text-tertiary leading-[1.5]">{stat.label}</dt>
                    <dd className="text-stats text-text-primary">{stat.value}</dd>
                </div>
            ))}
        </dl>
    );
}
