const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '؋ 0.00';
  }
  return `؋ ${Number(amount).toFixed(2)}`;
};

const pad2 = (value) => String(value).padStart(2, '0');

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [value];
};

const formatJalaliDate = (sourceDate, toJalali) => {
  if (!sourceDate) {
    return '';
  }

  try {
    const date = new Date(sourceDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const { jy, jm, jd } = toJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

    return `${pad2(jd)}/${pad2(jm)}/${jy}`;
  } catch (error) {
    console.warn('[QadAndamReceipt] Failed to format date:', error);
    return '';
  }
};

const kalaLayout = [
  ['قد', 'qad'],
  ['شانه', 'shana'],
  ['آستین', 'astin'],
  ['یخن', 'yakhan'],
  ['بغل', 'baghal'],
  ['چهاتی', 'daman'],
  ['سینه', 'seena'],
  ['شکم', 'shekm'],
  ['قول', 'qol'],
  ['تمبان', 'qadTunban'],
  ['پاچه', 'pacha'],
  ['کف', 'kaf'],
  ['بیین', 'bayen'],
  ['پتی', 'paty'],
  ['آستین ف', 'astinF'],
  ['فرمایش بازو', 'bazo'],
  ['نوعیت جیب', 'jebRoy'],
  ['نوعیت دامن', 'damanNew'],
  ['نوعیت چمک', 'chamakTar'],
  ['نوعیت تمبان', 'naweyatTunban'],
  ['نوعیت یخن', 'naweyatKala'],
  ['نوعیت توکمه', 'naweyatDukma'],
  ['نوعیت پاچه', 'naweyatPacha'],
  ['نوعیت پتی', 'naweyatPaty'],
];

const waskatLayout = [
  ['قد', 'qad'],
  ['شانه', 'shana'],
  ['بغل', 'baghal'],
  ['چهاتی', 'daman'],
  ['کمر', 'kamar'],
  ['سورین', 'sorin'],
  ['یخن', 'yakhan'],
  ['پاچه', 'pacha'],
  ['نوعیت پاچه', 'naweyatPacha'],
  ['پتی', 'paty'],
];

const measurementLayoutByType = (type) => {
  if (type === 'Kala') {
    return kalaLayout;
  }

  if (type === 'Waskat') {
    return waskatLayout;
  }

  return [];
};

const sanitizeLogoSource = (logo) => {
  if (!logo) return '';
  if (typeof logo === 'string' && logo.startsWith('data:')) {
    return logo;
  }
  if (typeof logo === 'string' && logo.length > 0) {
    return logo;
  }
  return '';
};

export const buildQadAndamReceiptHtml = ({
  qadAndam,
  customer,
  invoice,
  businessInfo,
  toJalali,
}) => {
  if (!qadAndam || !customer) {
    throw new Error('Missing qadAndam or customer data for receipt generation');
  }

  const measurements = typeof qadAndam.measurements === 'string'
    ? (() => {
        try {
          return JSON.parse(qadAndam.measurements || '{}');
        } catch (error) {
          console.warn('[QadAndamReceipt] Failed to parse measurements JSON:', error);
          return {};
        }
      })()
    : qadAndam.measurements || {};

  const getValue = (key) => {
    if (measurements[key] !== undefined && measurements[key] !== null && measurements[key] !== '') {
      return measurements[key];
    }

    if (qadAndam[key] !== undefined && qadAndam[key] !== null && qadAndam[key] !== '') {
      return qadAndam[key];
    }

    return '';
  };

  const layout = measurementLayoutByType(qadAndam.qadAndamType);

  const measurementItems = layout
    .map(([label, key]) => ({
      label,
      value: key ? getValue(key) : '',
    }))
    .filter(({ value }) => value !== undefined && value !== null && `${value}`.trim().length > 0);

  const midpoint = Math.ceil(measurementItems.length / 2);
  const leftMeasurements = measurementItems.slice(0, midpoint);
  const rightMeasurements = measurementItems.slice(midpoint);

  const renderMeasurementColumn = (items) => {
    if (!items.length) {
      return '<div class="measure-entry measure-entry--empty">&nbsp;</div>';
    }
    return items
      .map(
        ({ label, value }) => `
        <div class="measure-entry">
          <span class="measure-label">${label}</span>
          <span class="measure-value">${value}</span>
        </div>`
      )
      .join('');
  };

  const sanitizedBusinessInfo = {
    shopNameFull: businessInfo?.shopNameFull || '',
    ownerName: businessInfo?.ownerName || '',
    phoneNumbers: Array.isArray(businessInfo?.phoneNumbers)
      ? businessInfo.phoneNumbers
      : businessInfo?.phoneNumbers
      ? [businessInfo.phoneNumbers]
      : [],
    whatsapp: businessInfo?.whatsapp || '',
    logos: {
      primary: sanitizeLogoSource(businessInfo?.logos?.primary),
    },
  };

  const customerSerial =
    customer?.serial ||
    customer?.serialNumber ||
    customer?.customerCode ||
    customer?.id ||
    '';
  const customerName = customer?.name || customer?.customerName || '';
  const customerPhone = customer?.phone || customer?.phoneNumber || '';
  const joraCount = invoice?.joraCount ?? qadAndam?.joraCount ?? '-';
  const qadAndamNumber = qadAndam?.id ?? qadAndam?._id ?? '';

  const receiptPaid = Number(invoice?.paidAmount ?? qadAndam?.paidAmount ?? 0);
  const receiptTotal = Number(invoice?.totalAmount ?? qadAndam?.totalAmount ?? receiptPaid);
  const receiptDue = receiptTotal - receiptPaid;

  const jalaliConverter = toJalali || ((gy, gm, gd) => {
    // Adapted from jalaali-js (MIT)
    const breaks = [
      -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181,
      1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
      2456, 3178,
    ];

    const jalCal = (gYear) => {
      let bl = breaks.length;
      let gy2 = gYear - 621;
      let leapJ = -14;
      let jp = breaks[0];
      let jm, jump, leap;

      for (let i = 1; i < bl; i += 1) {
        jm = breaks[i];
        jump = jm - jp;
        if (gYear < jm) {
          break;
        }
        leapJ += Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
        jp = jm;
      }

      let n = gYear - jp;
      leapJ += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
      if (
        jump % 33 === 4 &&
        jump - n === 4
      ) {
        leapJ += 1;
      }

      let leapG = Math.floor(gYear / 4) - Math.floor((gYear / 100 + 1) * 3 / 4) - 150;
      let march = 20 + leapJ - leapG;

      if (jump - n === 4 && jump % 33 === 4) {
        march += 1;
      }

      leap = (((n + 1) % 33) - 1) % 4;
      if (leap === -1) {
        leap = 4;
      }

      return { gy2, march, leap };
    };

    const { gy2, march, leap } = jalCal(gy);
    let jy = gy2;
    let jm;
    let jd;
    let gDayNo =
      365 * gy +
      Math.floor((gy + 3) / 4) -
      Math.floor((gy + 99) / 100) +
      Math.floor((gy + 399) / 400);

    const gMonthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    gDayNo += gMonthDays[gm - 1] + gd;

    let jDayNo = gDayNo - march;
    if (jDayNo >= 0) {
      if (jDayNo <= 185) {
        jm = 1 + Math.floor(jDayNo / 31);
        jd = (jDayNo % 31) + 1;
      } else {
        jDayNo -= 186;
        jm = 7 + Math.floor(jDayNo / 30);
        jd = (jDayNo % 30) + 1;
      }
    } else {
      jy -= 1;
      jDayNo += 179;
      if (leap === 1) {
        jDayNo += 1;
      }
      jm = 7 + Math.floor(jDayNo / 30);
      jd = (jDayNo % 30) + 1;
    }

    return { jy, jm, jd };
  });

  const issueDate = formatJalaliDate(
    invoice?.issueDate || qadAndam?.registerDate,
    jalaliConverter
  );
  const dueDate = formatJalaliDate(
    invoice?.dueDate || qadAndam?.returnDate,
    jalaliConverter
  );
  const enterDate = formatJalaliDate(qadAndam?.enterDate, jalaliConverter);

  const parseDescription = () => {
    if (qadAndam.descriptionStructured) {
      return qadAndam.descriptionStructured;
    }
    if (typeof qadAndam.description === 'string') {
      try {
        return JSON.parse(qadAndam.description);
      } catch (error) {
        // ignore
      }
    }
    return {
      customFields: Array.isArray(qadAndam?.customFields) ? qadAndam.customFields : [],
      freeText: qadAndam?.freeText || '',
    };
  };

  const descriptionData = parseDescription();

  const specs = [];

  ensureArray(descriptionData.customFields).forEach((field) => {
    if (field?.label && field?.value) {
      specs.push(`${field.label}: ${field.value}`);
    }
  });

  if (descriptionData.freeText) {
    specs.push(descriptionData.freeText);
  }

  const specsHtml = specs.length
    ? `
      <div class="specs">
        <div class="section-title-small">فرمایشات</div>
        ${specs
          .map(
            (line) => `<div class="specs-line">
            ${line}
          </div>`
          )
          .join('')}
      </div>
    `
    : '';

  const measurementColumnsHtml = `
    <div class="measurements">
      <div class="measurements__column">
        ${renderMeasurementColumn(leftMeasurements)}
      </div>
      <div class="measurements__column">
        ${renderMeasurementColumn(rightMeasurements)}
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="fa">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            size: 80mm auto;
            margin: 6mm;
          }

          body {
            margin: 0;
            font-family: "Arial", "Tahoma", sans-serif;
            background-color: #f2f2f2;
            direction: rtl;
            color: #000;
          }

          .receipt {
            width: 80mm;
            margin: 0 auto;
            border: 2px solid #000;
            border-radius: 14px;
            padding: 10px;
            box-sizing: border-box;
            background-color: #fff;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 2px solid #000;
            border-radius: 12px;
            padding: 6px 8px;
            background: #fdfdfd;
          }

          .header__logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid #000;
            background: #fff;
          }

          .header__info {
            flex: 1;
            text-align: center;
            padding: 0 6px;
          }

          .header__title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 2px;
          }

          .header__subtitle {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .header__contact {
            font-size: 12px;
            font-weight: 600;
            margin: 1px 0;
          }

          .meta {
            border: 1px solid #000;
            border-radius: 8px;
            padding: 6px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
          }

          .meta__row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            gap: 6px;
            flex-wrap: wrap;
          }

          .meta__label {
            color: #333;
            font-weight: 600;
          }

          .meta__value {
            font-weight: 700;
          }

          .section-title {
            border: 1px solid #000;
            border-radius: 8px;
            margin: 10px 0 6px;
            padding: 4px 0;
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            background: #f8f8f8;
          }

          .measurements {
            display: flex;
            gap: 8px;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 6px;
            background: #fff;
          }

          .measurements__column {
            flex: 1;
          }

          .measure-entry {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            padding: 3px 0;
            border-bottom: 1px solid #c2c2c2;
          }

          .measure-entry:last-child {
            border-bottom: none;
          }

          .measure-entry--empty {
            border-bottom: none;
            height: 10px;
          }

          .measure-label {
            font-weight: 600;
            color: #444;
          }

          .measure-value {
            font-weight: 700;
            color: #000;
          }

          .section-title-small {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .specs {
            border: 1px solid #000;
            border-radius: 8px;
            padding: 6px;
            margin-top: 8px;
            background: #fdfdfd;
          }

          .specs-line {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .totals {
            border: 1px solid #000;
            border-radius: 8px;
            padding: 6px;
            font-size: 12px;
            font-weight: 700;
            margin-top: 8px;
            background: #fff;
          }

          .totals__row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .totals__row:last-child {
            margin-bottom: 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="header__info">
              <div class="header__title">${sanitizedBusinessInfo.shopNameFull || 'اکسپوز خیاطی'}</div>
              <div class="header__subtitle">${sanitizedBusinessInfo.ownerName || ''}</div>
              ${sanitizedBusinessInfo.phoneNumbers
                .map((phone) => `<div class="header__contact">تماس: ${phone}</div>`)
                .join('')}
              ${sanitizedBusinessInfo.whatsapp
                ? `<div class="header__contact">واتس اپ: ${sanitizedBusinessInfo.whatsapp}</div>`
                : ''}
            </div>
            ${
              sanitizedBusinessInfo.logos.primary
                ? `<img class="header__logo" src="${sanitizedBusinessInfo.logos.primary}" alt="Logo" />`
                : ''
            }
          </div>

          <div class="meta">
            <div class="meta__row">
              <span class="meta__label">آی دی مشتری:</span>
              <span class="meta__value">${customerSerial || '—'}</span>
              <span class="meta__label">نام مشتری:</span>
              <span class="meta__value">${customerName || '—'}</span>
            </div>
            <div class="meta__row">
              <span class="meta__label">تماس مشتری:</span>
              <span class="meta__value">${customerPhone || '—'}</span>
              <span class="meta__label">تعداد جوره:</span>
              <span class="meta__value">${joraCount}</span>
            </div>
            <div class="meta__row">
              <span class="meta__label">تاریخ ثبت:</span>
              <span class="meta__value">${issueDate || '—'}</span>
              <span class="meta__label">تاریخ تحویل:</span>
              <span class="meta__value">${dueDate || '—'}</span>
            </div>
            <div class="meta__row">
              <span class="meta__label">تاریخ ورود:</span>
              <span class="meta__value">${enterDate || '—'}</span>
              <span class="meta__label">شماره مشتری:</span>
              <span class="meta__value">${qadAndamNumber || '—'}</span>
            </div>
          </div>

          <div class="section-title">
            ${qadAndam?.qadAndamType === 'Kala' ? 'رسید جامی' : 'رسید واسکت'}
          </div>

          ${measurementColumnsHtml}

          ${specsHtml}

          <div class="totals">
            <div class="totals__row">
              <span>رسید:</span>
              <span>${formatCurrency(receiptPaid)}</span>
            </div>
            <div class="totals__row">
              <span>باقی مانده:</span>
              <span>${formatCurrency(receiptDue)}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default buildQadAndamReceiptHtml;

