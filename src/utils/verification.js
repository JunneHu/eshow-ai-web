export default {
	checkStr(str, type) {
		switch (type) {
			case 'mobile': //手机号码
				return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(str);
			case 'tel': //座机
				return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
			case 'card': //身份证
				return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str);
			case 'mobileCode': //6位数字验证码
				return /^[0-9]{6}$/.test(str);
			case 'name':
				return /^[a-zA-Z\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/.test(str)
			case 'aliPayNo': // 支付宝账号
				return /(^[a-zA-Z0-9_.@]{0,30}$)|(^(?=\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$).{0,30}$)/.test(
					str,
				);
			case 'bankNo': // 银行卡
				return /^[1-9]\d{14,19}$/.test(str);
			case 'pwd': //密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线
				return /^([a-zA-Z0-9_]){6,18}$/.test(str);
			case 'payPwd': //支付密码 6位纯数字
				return /^[0-9]{6}$/.test(str);
			case 'postal': //邮政编码
				return /[1-9]\d{5}(?!\d)/.test(str);
			case 'QQ': //QQ号
				return /^[1-9][0-9]{4,9}$/.test(str);
			case 'email': //邮箱
				return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);
			case 'money': //金额(小数点2位)
				return /^\d*(?:\.\d{0,2})?$/.test(str);
			case 'URL': //网址
				return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(
					str,
				);
			case 'IP': //IP
				return /((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))/.test(str);
			case 'date': //日期时间
				return (
					/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})(?:\:\d{2}|:(\d{2}):(\d{2}))$/.test(str) ||
					/^(\d{4})\-(\d{2})\-(\d{2})$/.test(str)
				);
			case 'number': //数字
				return /^[0-9]$/.test(str);
			case 'english': //英文
				return /^[a-zA-Z]+$/.test(str);
			case 'chinese': //中文
				return /^[\\u4E00-\\u9FA5]+$/.test(str);
			case 'lower': //小写
				return /^[a-z]+$/.test(str);
			case 'upper': //大写
				return /^[A-Z]+$/.test(str);
			case 'HTML': //HTML标记
				return /<("[^"]*"|'[^']*'|[^'">])*>/.test(str);
			default:
				return true;
		}
	},
	replaceStr(val,type) {
		switch (type) {
			case 'money': // 金额转化 如：399,889,888.99
				return val ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : val;
			case 'bankNo': // 银行卡号 每4位加空格
				return val ?
					val
					.toString()
					.replace(/\D/g, '')
					.replace(/(....)(?=.)/g, '$1 ') :
					val;
			case 'hideBankNo': // 银行卡号 ****
				let str = val
				if(val){
					str = `${val.toString().slice(0, 4)} ************ ${val.toString().slice(-4)}`
				}
				return str;
			case 'phone': // 手机号 344 如：181 8614 6970
				if (val) {
					const matches = /^(\d{3})(\d{4})(\d{4})$/.exec(val);
					if (matches) {
						return matches[1] + ' ' + matches[2] + ' ' + matches[3];
					}
				}
				return val;
			case 'hidePhone': // 手机号 ****
				if (val) {
					const matches = /^(\d{3})(\d{4})(\d{4})$/.exec(val);
					if (matches) {
						return matches[1] + ' **** ' + matches[3];
					}
				}
				return val;
			default:
				return val;
		}
	},
}