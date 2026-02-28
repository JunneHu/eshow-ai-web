/*
 * @Author: JunneyHu
 * @Date: 2025-04-22 11:06:07
 * @LastEditor: ${CURRENT_USER}
 * @LastEditTime: 2025-05-29 19:11:02
 * @FilePath: \apiplat\src\utils\commonhttpFn.js
 */
import { GetProductCategory } from '@/api/common';
import { storageSetItem } from '@/utils/dateUtil';


export const GetProductCategoryFn = async () => {
  const res = await GetProductCategory({ classLevel: 1 });
  const res1 = await GetProductCategory({ classLevel: 2 });
  const res2 = await GetProductCategory({ classLevel: 3 });
  if (Number(res.code) === 0 && res?.data?.length > 0) {
    res.data.map((v) => {
      v.showName = 'categoryIdL1-' + v.id;
      if (res1.data.length > 0) {
        v.list = res1.data.filter((v1) => v1.parentClassId === v.id);
        v.list.map((v2) => {
          v2.showName = 'categoryIdL2-' + v2.id;
          if (res2.data.length > 0) {
            v2.list = res2.data.filter((v3) => v3.parentClassId === v2.id);
            v2.list.map((v4) => {
              v4.showName = 'categoryIdL3-' + v4.id;
            });
          }
        });
      }
    });
    console.log('GetProductCategoryFn', res.data);
    // 使用带过期时间的存储，默认2小时
    storageSetItem('productCategory', res.data);
    return res.data;
  }else{
    return [];
  }
};