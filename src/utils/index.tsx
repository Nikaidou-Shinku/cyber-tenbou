export const checkTenbou = (tenbou: string): number | null => {
  if (tenbou === "") {
    alert("填点东西啊兄弟。");
    return null;
  }

  let value;
  try {
    value = parseInt(tenbou);
  } catch (err) {
    alert("你家点棒还能不是整数的吗。");
    return null;
  }

  if (value % 100 !== 0) {
    alert("你家点棒还能不是整百地给的吗。");
    return null;
  }

  return value / 100;
};

export const calcPoint = (
  han: string,
  fu: string,
  isTsumo: boolean,
  isOya: boolean,
): number | null => {
  let hanVal;
  try {
    hanVal = parseInt(han);
  } catch (err) {
    alert("你家番数还能不是整数的吗。");
    return null;
  }

  if (hanVal < 1) {
    alert("你家番数还能小于 1 的吗。");
    return null;
  }

  let fuVal;
  try {
    fuVal = parseInt(fu);
  } catch (err) {
    alert("你家符数还能不是整数的吗。");
    return null;
  }

  if (fuVal < 20) {
    alert("你家符数还能小于 20 的吗。");
    return null;
  }

  if (fuVal % 10 === 0 || fuVal === 25) {
    let basePoint;
    if (hanVal >= 13) {
      // 累计役满
      basePoint = 8000;
    } else if (hanVal >= 11) {
      // 三倍满
      basePoint = 6000;
    } else if (hanVal >= 8) {
      // 倍满
      basePoint = 4000;
    } else if (hanVal >= 6) {
      // 跳满
      basePoint = 3000;
    } else if (hanVal >= 5) {
      // 满贯
      basePoint = 2000;
    } else {
      basePoint = Math.pow(2, hanVal + 2) * fuVal;

      if (basePoint > 2000) {
        // 切上满贯
        basePoint = 2000;
      }
    }

    const res = basePoint * (isOya ? (isTsumo ? 2 : 6) : isTsumo ? 1 : 4);
    return Math.ceil(res / 100) * 100;
  } else {
    alert(`你家符数还能是 ${fuVal} 的吗。`);
    return null;
  }
};
