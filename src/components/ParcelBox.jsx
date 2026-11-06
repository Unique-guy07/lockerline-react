/**
 * A cardboard parcel drawn in three faces (front, lit top, shaded side) with packing tape and a
 * shipping label. Its proportions follow the parcel's size: S is flat, M is near-cube, L is tall.
 * `label` lines are printed on the shipping label; `scale` shrinks or grows the whole box.
 */
const SIZES = {
  S: { w: 66, h: 34, d: 20 },
  M: { w: 74, h: 56, d: 24 },
  L: { w: 80, h: 86, d: 28 },
};

export default function ParcelBox({ size = 'M', label = [], scale = 1 }) {
  const { w, h, d } = SIZES[size] ?? SIZES.M;
  const style = { '--w': `${w * scale}px`, '--h': `${h * scale}px`, '--d': `${d * scale}px` };
  return (
    <span className={`parcel3d size-${size}`} style={style} aria-hidden="true">
      <span className="parcel3d-top" />
      <span className="parcel3d-top-tape" />
      <span className="parcel3d-side" />
      <span className="parcel3d-front">
        <span className="parcel3d-tape" />
        <span className="parcel3d-label">
          {label.map((line) => <span key={line} className="parcel3d-label-line">{line}</span>)}
          <span className="parcel3d-barcode" />
        </span>
      </span>
    </span>
  );
}
