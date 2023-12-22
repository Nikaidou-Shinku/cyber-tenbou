/**
 * 点棒支付记录
 */
export interface PayRecord {
  /**
   * 支付者
   */
  payer: string;
  /**
   * 接受者
   */
  receiver: string;
  /**
   * 点棒数量(/100)
   */
  count: number;
}
