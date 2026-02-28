/*
 * @Author: JunneyHu
 * @Date: 2025-04-22 11:06:06
 * @LastEditor: ${CURRENT_USER}
 * @LastEditTime: 2025-05-29 10:09:58
 * @FilePath: \apiplat\src\components\ComTable\index.js
 */

import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ProTable } from '@ant-design/pro-components';

/***
 * requestData：请求数据
 * headerTitle：表头标题
 * getCheckboxProps：禁用的行
 * optionRender：自定义操作
 * columns：列配置
 * hasRowSelection：是否显示选择框
 * choseType：选择类型
 * scroll：滚动配置
 * 
 * **/

const ComTable = forwardRef((props, ref) => {
  const { columns, choseType, scroll } = props;
  const actionRef = useRef(null);

  const getSearchConfig = () => {
    return {
      labelWidth: 'auto',
      defaultCollapsed: true,
      optionRender: (searchConfig, formProps, dom) => {
        return [
          ...dom.reverse(),
          props?.optionRender
        ]
      }
    }
  }
  useImperativeHandle(ref, () => ({
    reloadData,
  }));

  const reloadData = () => {
    actionRef?.current?.reload();
    resetAll();
  }

  const resetAll = () => {
    actionRef?.current?.clearSelected?.();
    props?.onRowSelectionChange?.(undefined, undefined);
  }

  return (
    <ProTable
      columns={columns}
      actionRef={actionRef}
      bordered
      size="small"
      scroll={scroll || {
        x: 'max-content' // 水平滚动，根据内容自适应宽度
      }}
      onSubmit={() => {
        resetAll();
      }}
      onReset={() => {
        resetAll();
      }}
      request={props?.requestData}
      rowKey={record => record.id}
      rowSelection={props?.hasRowSelection ? {
        type: choseType || 'checkbox',
        preserveSelectedRowKeys: true,
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(selectedRowKeys, selectedRows, 'selectedRowKeys, selectedRows');
          if (props.onRowSelectionChange) {
            props.onRowSelectionChange(selectedRowKeys, selectedRows);
          }
        },
        getCheckboxProps: props?.getCheckboxProps || null,
      } : undefined}
      search={getSearchConfig()}
      options={false}
      headerTitle={props?.headerTitle}
      pagination={{
        showQuickJumper: true,
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true
      }}
      dateFormatter="string"
      {...props}
    />
  )
});
export default ComTable;