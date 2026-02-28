// 票据类型解析
import { TicketTypeDict, InvoiceRateList } from '@/enums/selectEnum';
export const invoiceTypeFn = (invoiceType, invoiceRate) => {
    // 如果 invoiceType 和 invoiceRate 都不存在，返回 '-'
    if ((invoiceType === undefined && invoiceRate === undefined) || (invoiceType === null && invoiceRate === null)) {
        return '-';
    }
    
    // 如果 invoiceType 为 0，返回 '无票'
    if (invoiceType === 0) {
        return '无票';
    }
    
    // 获取票据类型标签
    const typeLabel = TicketTypeDict.find(v => v.value === invoiceType)?.label || '';
    
    // 如果 invoiceRate 不存在，只返回票据类型
    if (!invoiceRate) {
        return typeLabel;
    }
    
    // 获取税率标签
    const rateLabel = InvoiceRateList.find(v => v.value === invoiceRate)?.label || '';
    
    // 返回组合的字符串
    return rateLabel ? `${rateLabel}-${typeLabel}` : typeLabel;
}