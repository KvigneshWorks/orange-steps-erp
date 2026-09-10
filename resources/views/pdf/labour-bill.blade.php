<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
@php
  /*
   * Embed logo images as base64 so dompdf can render them without
   * remote-URL access or file-path issues on Windows XAMPP.
   */
  $logoPath  = base_path('../frontend/public/logo.png');
  $logo2Path = base_path('../frontend/public/LOGO 2.png');

  $logoData  = file_exists($logoPath)
      ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
      : null;
  $logo2Data = file_exists($logo2Path)
      ? 'data:image/png;base64,' . base64_encode(file_get_contents($logo2Path))
      : null;

  $totalPrevBal = $bill->payments->sum('previous_balance');
  $totalShifts  = $bill->payments->sum('total_shifts');
  $billNo       = str_pad($bill->id, 4, '0', STR_PAD_LEFT);
@endphp
<style>
/* ── RESET ───────────────────────────────────────────── */
* { margin:0; padding:0; box-sizing:border-box; }

body {
  font-family: 'DejaVu Sans', Arial, sans-serif;
  font-size: 11px;
  color: #1C1208;
  background: #FFF8F0;
}

/* ── WATERMARK (fixed = appears on every page behind content) ─── */
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 460px;
  height: 460px;
  margin-top: -230px;
  margin-left: -230px;
  z-index: -1000;
  opacity: 0.06;
}

/* ── HEADER TABLE ────────────────────────────────────── */
.hdr-tbl { width:100%; border-collapse:collapse; background:#1C1208; }
.hdr-left { padding:16px 20px 14px; vertical-align:middle; width:68%; }
.hdr-right {
  padding:16px 20px 14px;
  vertical-align:middle;
  text-align:right;
  border-left:2px solid #3D2D10;
}
.company-name {
  font-size:21px; font-weight:bold; color:#F5A623;
  letter-spacing:1px; margin-bottom:2px;
}
.company-tag {
  font-size:7.5px; color:#9A7840; letter-spacing:3px;
  text-transform:uppercase;
}
.bill-doc-label {
  font-size:11px; font-weight:bold; color:#FFF8F0;
  letter-spacing:0.8px; margin-top:7px; text-transform:uppercase;
}

.bill-num  { font-size:18px; font-weight:bold; color:#F5A623; }
.bill-date { font-size:8.5px; color:#9A7840; margin-top:4px; }
.status-pill {
  display:inline-block;
  background:#F5A623; color:#1C1208;
  font-size:7px; font-weight:bold;
  padding:3px 11px; letter-spacing:1.5px;
  text-transform:uppercase; margin-top:7px;
}

/* ── ORANGE ACCENT STRIPE ────────────────────────────── */
.stripe-top    { width:100%; height:4px; background:#F5A623; }
.stripe-bottom { width:100%; height:3px; background:#F5A623; }

/* ── WEEK BANNER ──────────────────────────────────────── */
.week-banner {
  background:#FFF0CC;
  border-top:2px solid #F5A623;
  border-bottom:2px solid #F5A623;
  padding:9px 20px;
  text-align:center;
  font-size:11.5px;
  font-weight:bold;
  color:#7A4000;
  letter-spacing:0.5px;
}

/* ── SUMMARY STATS ────────────────────────────────────── */
.sum-tbl { width:100%; border-collapse:collapse; background:#FFF8F0; }
.sum-tbl td {
  padding:14px 8px;
  text-align:center;
  border:1px solid #E8C87A;
  border-top:none;
}
.sum-lbl {
  font-size:7px; text-transform:uppercase;
  letter-spacing:1.8px; color:#A08050; font-weight:bold;
  margin-bottom:5px;
}
.sum-val        { font-size:15px; font-weight:bold; color:#1C1208; }
.sum-val-amber  { font-size:15px; font-weight:bold; color:#B86800; }
.sum-val-red    { font-size:15px; font-weight:bold; color:#B02A10; }
.sum-val-green  { font-size:15px; font-weight:bold; color:#1A6A30; }

/* ── CARRY-OVER NOTE ──────────────────────────────────── */
.carry-note {
  margin:12px 20px 4px;
  padding:9px 14px;
  background:#FFF0CC;
  border-left:4px solid #F5A623;
  font-size:9.5px;
  color:#7A4000;
}

/* ── SECTION HEADING ──────────────────────────────────── */
.section-head {
  padding:10px 20px 8px;
  font-size:9px;
  font-weight:bold;
  text-transform:uppercase;
  letter-spacing:2.5px;
  color:#A08050;
  background:#FFF8F0;
  border-bottom:1px solid #E8C87A;
}
.dot {
  display:inline-block;
  width:6px; height:6px;
  background:#F5A623;
  margin-right:8px;
  vertical-align:middle;
  margin-bottom:1px;
}

/* ── WORKER TABLE ────────────────────────────────────── */
.wt { width:100%; border-collapse:collapse; }

.wt thead th {
  background:#2D1F08;
  color:#F5A623;
  font-size:7.5px;
  font-weight:bold;
  letter-spacing:1.5px;
  text-transform:uppercase;
  padding:8px 9px;
  text-align:left;
  border-right:1px solid #3D2D10;
}
.wt thead th:last-child { border-right:none; }
.wt thead th.r { text-align:right; }
.wt thead th.c { text-align:center; }

.wt tbody tr:nth-child(odd)  td { background:#FFF8F0; }
.wt tbody tr:nth-child(even) td { background:#FFF3DC; }
.wt tbody td {
  padding:9px 9px;
  border-bottom:1px solid #E8D09A;
  border-right:1px solid #EED8A8;
  vertical-align:middle;
  font-size:10.5px;
  color:#1C1208;
}
.wt tbody td:last-child { border-right:none; }
.r  { text-align:right; }
.c  { text-align:center; }

.wname { font-weight:bold; font-size:11px; color:#1C1208; }
.wsub  { font-size:8.5px; color:#9A7040; margin-top:2px; }

.a-earn { font-weight:bold; color:#1C1208; }
.a-due  { font-weight:bold; color:#A82010; }
.a-paid { font-weight:bold; color:#186828; }
.a-bal  { font-weight:bold; color:#A86000; }
.a-zero { color:#C8B890; font-style:italic; }

.badge {
  padding:2px 9px;
  font-size:7.5px;
  font-weight:bold;
  text-transform:uppercase;
  letter-spacing:0.8px;
  border-radius:2px;
}
.badge-paid    { background:#CCEED8; color:#0A5020; }
.badge-partial { background:#FFF0C0; color:#805000; }
.badge-pending { background:#FFE0D0; color:#801010; }

/* ── TOTALS FOOTER ROW ───────────────────────────────── */
.wt tfoot td {
  background:#1C1208;
  color:#F5A623;
  font-weight:bold;
  font-size:10px;
  padding:9px 9px;
  border-right:1px solid #2D1F08;
}
.wt tfoot td:last-child { border-right:none; }
.wt tfoot td.r      { text-align:right; }
.wt tfoot .c-due    { color:#FFB0A0; }
.wt tfoot .c-paid   { color:#90EAA0; }
.wt tfoot .c-bal    { color:#FFD870; }

/* ── PAGE FOOTER ─────────────────────────────────────── */
.pg-footer {
  margin-top:22px;
  background:#1C1208;
  padding:11px 20px;
}
.ft-tbl { width:100%; border-collapse:collapse; }
.ft-tbl td { vertical-align:middle; padding:0; }
.ft-left  { font-size:8px; color:#9A7840; }
.ft-mid   { font-size:10px; font-weight:bold; color:#F5A623; text-align:center; }
.ft-right { font-size:8px; color:#9A7840; text-align:right; }
</style>
</head>
<body>

{{-- ══ WATERMARK (behind all content) ══════════════════════ --}}
@if($logo2Data)
<div class="watermark">
  <img src="{{ $logo2Data }}" style="width:100%; height:100%;">
</div>
@endif

{{-- ══ HEADER ═══════════════════════════════════════════════ --}}
<div class="stripe-top"></div>
<table class="hdr-tbl">
  <tr>
    <td class="hdr-left">
      @if($logoData)
        <img src="{{ $logoData }}" style="height:48px; max-width:190px; margin-bottom:6px;"><br>
      @else
        <div class="company-name">WhiteNode Software Solutions</div>
      @endif
      <div class="company-tag">Enterprise Resource Planning</div>
      <div class="bill-doc-label">&#x2022;&nbsp; Labour Weekly Payment Bill &nbsp;&#x2022;</div>
    </td>
    <td class="hdr-right">
      <div class="bill-num">BILL&nbsp;#{{ $billNo }}</div>
      <div class="bill-date">
        Generated:&nbsp;{{ now()->format('d M Y, h:i A') }}<br>
        Week:&nbsp;{{ \Carbon\Carbon::parse($bill->week_start)->format('d M Y') }}
        &mdash;
        {{ \Carbon\Carbon::parse($bill->week_end)->format('d M Y') }}
      </div>
      <div><span class="status-pill">{{ strtoupper($bill->status) }}</span></div>
    </td>
  </tr>
</table>
<div class="stripe-top" style="height:2px; background:#3D2D10;"></div>

{{-- ══ WEEK BANNER ══════════════════════════════════════════ --}}
<div class="week-banner">
  &#x1F4C5;&nbsp;&nbsp;Payment Week&nbsp;&nbsp;
  <strong>{{ \Carbon\Carbon::parse($bill->week_start)->format('l, d M Y') }}</strong>
  &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
  <strong>{{ \Carbon\Carbon::parse($bill->week_end)->format('l, d M Y') }}</strong>
</div>

{{-- ══ SUMMARY STATS ════════════════════════════════════════ --}}
<table class="sum-tbl">
  <tr>
    <td>
      <div class="sum-lbl">Workers</div>
      <div class="sum-val">{{ $bill->total_workers }}</div>
    </td>
    <td>
      <div class="sum-lbl">Total Shifts</div>
      <div class="sum-val">{{ number_format($totalShifts, 1) }}</div>
    </td>
    <td>
      <div class="sum-lbl">This Week Earned</div>
      <div class="sum-val">&#x20B9;{{ number_format($bill->total_earned, 2) }}</div>
    </td>
    <td>
      <div class="sum-lbl">Total Due</div>
      <div class="sum-val-red">&#x20B9;{{ number_format($totalDue, 2) }}</div>
    </td>
    <td>
      <div class="sum-lbl">Amount Paid</div>
      <div class="sum-val-green">&#x20B9;{{ number_format($bill->total_paid, 2) }}</div>
    </td>
    <td>
      <div class="sum-lbl">Balance Carried</div>
      <div class="sum-val-amber">&#x20B9;{{ number_format($bill->total_balance, 2) }}</div>
    </td>
  </tr>
</table>

{{-- ══ CARRY-OVER NOTICE ════════════════════════════════════ --}}
@if($totalPrevBal > 0)
<div class="carry-note">
  &#x26A0;&nbsp;
  This bill includes carry-over balances from previous weeks totalling
  <strong>&#x20B9;{{ number_format($totalPrevBal, 2) }}</strong>.
  Each worker's &ldquo;Total Due&rdquo; already includes their outstanding balance.
</div>
@endif

{{-- ══ SECTION HEADING ══════════════════════════════════════ --}}
<div class="section-head">
  <span class="dot"></span>Worker-wise Breakdown
</div>

{{-- ══ WORKER TABLE ═════════════════════════════════════════ --}}
<table class="wt">
  <thead>
    <tr>
      <th style="width:22%;">Worker</th>
      <th class="r" style="width:6%;">Shifts</th>
      <th class="r" style="width:9%;">Rate/Day</th>
      <th class="r" style="width:11%;">This Week</th>
      <th class="r" style="width:10%;">Prev Bal.</th>
      <th class="r" style="width:11%;">Total Due</th>
      <th class="r" style="width:11%;">Paid</th>
      <th class="r" style="width:12%;">Carry Bal.</th>
      <th class="c" style="width:8%;">Status</th>
    </tr>
  </thead>
  <tbody>
    @foreach($bill->payments as $p)
    <tr>
      <td>
        <div class="wname">{{ $p->worker_name }}</div>
        <div class="wsub">
          {{ $p->total_shifts }} shifts &times;
          &#x20B9;{{ number_format($p->daily_rate, 2) }}/shift
        </div>
      </td>
      <td class="r">{{ $p->total_shifts }}</td>
      <td class="r">&#x20B9;{{ number_format($p->daily_rate, 2) }}</td>
      <td class="r a-earn">&#x20B9;{{ number_format($p->total_earned, 2) }}</td>
      <td class="r">
        @if($p->previous_balance > 0)
          <span class="a-bal">&#x20B9;{{ number_format($p->previous_balance, 2) }}</span>
        @else
          <span class="a-zero">&mdash;</span>
        @endif
      </td>
      <td class="r a-due">&#x20B9;{{ number_format($p->total_due, 2) }}</td>
      <td class="r">
        @if($p->amount_paid > 0)
          <span class="a-paid">&#x20B9;{{ number_format($p->amount_paid, 2) }}</span>
        @else
          <span class="a-zero">&mdash;</span>
        @endif
      </td>
      <td class="r">
        @if($p->balance_carried > 0)
          <span class="a-bal">&#x20B9;{{ number_format($p->balance_carried, 2) }}</span>
        @else
          <span class="a-paid">&#x2713;&nbsp;Clear</span>
        @endif
      </td>
      <td class="c">
        <span class="badge badge-{{ $p->status }}">{{ ucfirst($p->status) }}</span>
      </td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td><strong>TOTAL &mdash; {{ $bill->total_workers }} Workers</strong></td>
      <td class="r">{{ number_format($totalShifts, 1) }}</td>
      <td></td>
      <td class="r">&#x20B9;{{ number_format($bill->total_earned, 2) }}</td>
      <td class="r">&#x20B9;{{ number_format($totalPrevBal, 2) }}</td>
      <td class="r c-due">&#x20B9;{{ number_format($totalDue, 2) }}</td>
      <td class="r c-paid">&#x20B9;{{ number_format($bill->total_paid, 2) }}</td>
      <td class="r c-bal">&#x20B9;{{ number_format($bill->total_balance, 2) }}</td>
      <td></td>
    </tr>
  </tfoot>
</table>

{{-- ══ PAGE FOOTER ══════════════════════════════════════════ --}}
<div style="margin-top:24px;">
  <div class="stripe-bottom"></div>
  <div class="pg-footer">
    <table class="ft-tbl">
      <tr>
        <td>
          <div class="ft-left">
            WhiteNode Software Solutions &middot; Labour Management Module<br>
            Auto-generated &middot; {{ now()->format('d M Y, h:i A') }}
          </div>
        </td>
        <td>
          <div class="ft-mid">WhiteNode Software Solutions</div>
        </td>
        <td>
          <div class="ft-right">
            Balance &nbsp;<strong style="color:#F5A623;">&#x20B9;{{ number_format($bill->total_balance, 2) }}</strong><br>
            carries forward to next week
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div class="stripe-bottom"></div>
</div>

</body>
</html>
