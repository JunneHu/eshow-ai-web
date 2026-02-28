import findIndex from 'lodash/findIndex';
import remove from 'lodash/remove';
import { message } from 'antd';

export default (value, selectedRowKeys, selectedRows, param, config = {}) => {
    selectedRowKeys = [...selectedRowKeys];
    selectedRows = [...selectedRows];
    return {
        ...config,
        selectedRowKeys,
        onChange(selectedRowKeys) {
            // if (selectedRowKeys.length > 20) {
            //     return message.error('监控对象不能超过20个');
            // }
            value.setState({ selectedRowKeys });
        },
        onSelect: (record, selected) => {
            if (selected) {
                // if (selectedRowKeys.length > 19) {
                //     return;
                // }
                // 如果数组里面不存在则做添加
                if (findIndex(selectedRows, record[param]) < 0) {
                    selectedRows.push(record);
                }
            } else {
                remove(selectedRows, (n) => {
                    return n[param] == record[param];
                });
            }
            value.setState({
                selectedRows
            });
        },
        onSelectAll: (selected, selectedRow, changeRows) => {
            if (selected) {
                // if (selectedRowKeys.length + changeRows.length > 20) {
                //     return;
                // }
                for (let index = 0; index < changeRows.length; index += 1) {
                    if (findIndex(selectedRows, changeRows[index][param]) < 0) {
                        selectedRows.push(changeRows[index]);
                    }
                }
            } else {
                for (let index = 0; index < changeRows.length; index += 1) {
                    remove(selectedRows, (n) => (
                        n[param] == changeRows[index][param]
                    ));
                }
            }

            value.setState({
                selectedRows
            });
        }
    };
};
