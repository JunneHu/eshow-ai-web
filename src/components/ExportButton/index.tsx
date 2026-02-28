/*
 * @Author: JunneyHu
 * @Date: 2025-04-22 11:06:06
 * @LastEditor: ${CURRENT_USER}
 * @LastEditTime: 2025-04-27 16:19:34
 * @FilePath: \erpplat\src\components\Common\ExportButton\index.tsx
 */
import React from 'react';
import { Button } from 'antd';
import Http from '@/utils/http';
import Api from '@/configs/api';
import moment from 'moment'
import { withRouter } from 'react-router-dom';

const ExportButton = (props) => {
    const exportList = async () => {
        const { searchParams, exportMethod,exportTitle } = props;
        return Http.post(
            Api[exportMethod],
            { ...searchParams },
            {showError:false},
            { responseType: 'blob' }
        ).then(response => {
            // 说明没有异常
            if (response && response instanceof Blob && response.type !== 'application/json') {
                const url = URL.createObjectURL(response)
                let a = document.createElement('a');
                a.href = url;
                a.download = `${exportTitle}${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`
                a.click();
                a.remove();
            }
        })

    };
    return (
        <Button onClick={exportList}>{props.children}</Button>
    );
};

export default withRouter(ExportButton);