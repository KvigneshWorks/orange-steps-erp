<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Request received</title>
</head>
<body style="margin:0; padding:0; background-color:#EFEAE0; font-family:Arial, Helvetica, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFEAE0; padding:36px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">

        <!-- Wordmark -->
        <tr>
          <td align="center" style="padding-bottom:18px;">
            <span style="font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; letter-spacing:2px; color:#8A7A55; text-transform:uppercase;">
              WhiteNode&nbsp;ERP
            </span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background-color:#0A1530; background-image:linear-gradient(160deg,#0A1530,#0D2148); border-radius:14px; padding:0; overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="background-color:#3B82F6; background-image:linear-gradient(90deg,#1D4ED8,#3B82F6,#D8A94E,#3B82F6); height:4px; line-height:4px; font-size:0;">&nbsp;</td>
              </tr>

              <tr>
                <td style="padding:34px 36px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:rgba(59,130,246,0.16); border:1px solid rgba(59,130,246,0.4); border-radius:100px; padding:6px 14px;">
                        <span style="font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; letter-spacing:1px; color:#8FB4FA; text-transform:uppercase;">
                          Request Received
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:14px 36px 0;">
                  <span style="font-family:Arial,Helvetica,sans-serif; font-size:22px; font-weight:bold; color:#FAF6EC; line-height:1.4;">
                    Hi {{ $req->name }}, we've got your request
                  </span>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 36px 26px;">
                  <span style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#B7C0D6; line-height:1.6;">
                    Your request for <strong style="color:#E8E1D2;">{{ ucwords(str_replace('_',' ', $req->role)) }}</strong> access to WhiteNode ERP has been sent to the MD for review. Nothing further is needed from you right now.
                  </span>
                </td>
              </tr>

              <!-- Details box -->
              <tr>
                <td style="padding:0 36px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(246,240,228,0.05); border:1px solid rgba(246,240,228,0.14); border-radius:10px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8296C2; width:90px;">Email</td>
                            <td style="padding:6px 0; font-family:'Courier New',monospace; font-size:13px; color:#E8E1D2;">{{ $req->email }}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8296C2;">Role requested</td>
                            <td style="padding:6px 0;">
                              <span style="font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; color:#E8C97C; background-color:rgba(216,169,78,0.12); border:1px solid rgba(216,169,78,0.35); border-radius:6px; padding:3px 9px;">
                                {{ ucwords(str_replace('_',' ', $req->role)) }}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:26px 36px 32px;">
                  <span style="font-family:Arial,Helvetica,sans-serif; font-size:12.5px; color:#8296C2; line-height:1.6;">
                    You'll get another email as soon as a decision is made — usually within 24 hours.
                  </span>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:20px;">
            <span style="font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#9A9385;">
              Automated message from WhiteNode ERP &middot; Orange Steps
            </span>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
