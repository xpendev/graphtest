export function TransitionNetworkSummary() {
  return (
    <aside className="tn-summary" aria-label="サマリ">
      <div className="tn-summary-badge">
        <div className="tn-summary-badge-title">集計項目</div>
        <div className="tn-summary-badge-line">前期購入量 → 当期購入量</div>
        <div className="tn-summary-badge-line">購入量差, 購入量比</div>
      </div>
      <div className="tn-summary-base">
        <div className="tn-summary-base-title">ベース金額</div>
        <div className="tn-summary-base-line">前期 26/01-26/06</div>
        <div className="tn-summary-base-line">当期 26/01-26/03</div>
      </div>
    </aside>
  )
}
