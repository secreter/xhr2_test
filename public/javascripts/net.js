// ajax({
// 	url:'http://localhost:3000/ajax',
// 	dataType:'json',
// 	method:'post',
// 	data:{},
// 	success:function(a,b){
// 		alert(11)
// 		console.log(a,b)
// 	},
// 	error:function(e){
// 		console.log(e)
// 	},
// })
function ajax(option){
	option=option||{}
	option.method = (option.method || "GET").toUpperCase()
	option.dataType=option.dataType||'json'
	let param=formatParam(option.data)
	let xhr=null
	//创建 - 非IE6 - 第一步
	if(window.XMLHttpRequest){
		xhr=new XMLHttpRequest()
	}else{
		//IE6及其以下版本浏览器
		xhr = new ActiveXObject('Microsoft.XMLHTTP')
	}
	//接收 - 第三步
	xhr.onreadystatechange=function(){
	// debugger
		if (xhr.readyState == 4) {
			let status = xhr.status
			if (status >= 200 && status <300 ) {
				option.success && option.success(xhr.responseText, xhr.responseXML)
			} else {
				option.error && option.error(status)
			}
		}
	}
	//连接 和 发送 - 第二步
	if (option.method == 'GET') {
		xhr.open('GET',option.url + '?' +param,true)
		xhr.send(null)
	}else{
		xhr.open('POST',option.url,true)
		//设置表单提交时的内容类型
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.send(param)
	}


}
function formatParam(obj){
	let arr=[]
	for(let key in obj){
		arr.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key]))
	}
	arr.push(("v=" + Math.random()).replace(".",''))
	return arr.join('&')
}


function sendAjax() {
	var form=document.getElementById('user')
  //构造表单数据
  var formData = new FormData(form);
  formData.append('username', 'johndoe');
  formData.append('id', 123456);
  //创建xhr对象 
  var xhr = new XMLHttpRequest();
  //设置xhr请求的超时时间
  xhr.timeout = 3000;
  //设置响应返回的数据格式
  xhr.responseType = "blob";
  //创建一个 post 请求，采用异步
  // xhr.open('POST', 'http://localhost:3000/ajax', true);
  xhr.open('GET', 'http://localhost:3000/images/1.jpg', true);
  //注册相关事件回调处理函数
  xhr.onload = function(e) { 
  	var header=this.getAllResponseHeaders()
    if(this.status == 200||this.status == 304){
    		var img=document.createElement('img')
    		//URL.createObjectURL() 静态方法会创建一个 DOMString，它的 URL 表示参数中的对象。这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的URL 对象表示着指定的 File 对象或者 Blob 对象。
    		img.src= window.URL.createObjectURL(this.response)
    		document.body.appendChild(img)
        console.log(this.response)
        console.log(this)
        console.log(header)
    }
  };
  xhr.onprogress = updateProgress;
	xhr.upload.onprogress = updateProgress;
	function updateProgress(event) {
	    if (event.lengthComputable) {
	      var completedPercent = event.loaded / event.total;
	      console.log(completedPercent)
	    }
	 }
  xhr.ontimeout = function(e) { console.log("ontimeout") };
  xhr.onerror = function(e) { console.log("onerror") };
  xhr.upload.onprogress = function(e) { console.log("onprogress") };
  
  //发送数据
  xhr.send(formData);
}

