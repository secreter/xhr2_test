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
	if (!option.url) {
		console.warn('ajax缺少url')
	}
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



function ajax2(option){
	if (!option.url) {
		console.warn('ajax缺少url')
	}
	option=option||{}
	option.method = (option.method || "GET").toUpperCase()
	option.responseType=option.responseType||''
	option.header=option.header||{}
	option.timeout=option.timeout||0
	option.form=option.form||null
	option.data=option.data||{}
	let param='',formData=null
	//创建xhr对象 
  let xhr = new XMLHttpRequest()
  //设置xhr请求的超时时间
  xhr.timeout = option.timeout
  //设置header
  for(let key in option.header){
		xhr.setRequestHeader(key, option.header[key])
	}
  //设置响应返回的数据格式
  xhr.responseType = option.responseType
  if (option.method==="GET") {
  	//因为get请求不支持formdata，单独处理
  	param=formatParam(option.data)
  	xhr.open(option.method, option.url + '?' + param, true)
  }else{
  	//构造表单数据
		formData = new FormData(option.form)
		for(let key in option.data){
			formData.append(key, option.data[key])
		}
		//创建一个 请求，采用异步
  	xhr.open(option.method, option.url, true)
  }
  
   //注册相关事件回调处理函数
  xhr.onload = function(event) {
  	//如果请求成功
    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
      //do successCallback
      option.success && option.success(xhr.response)
    }else{
    	option.error && option.error(xhr.status)
    }
  }
  //网络等错误
  xhr.onerror=function(event){
    console.warn(xhr.response)
  }
  //超时
  xhr.ontimeout=function(event){
  	option.ontimeout&&option.ontimeout(event)
  }
  //下载进度
  xhr.onprogress = function(event){
  	option.progress&&option.progress(event)
  }
  //上传进度
	xhr.upload.onprogress = function(event){
  	option.uploadProgress&&option.uploadProgress(event)
  }
  //发送数据
  try{
  	//断网时发送失败会导致程序不能继续执行
  	xhr.send(formData)
  }catch(e){
  	console.error('发送失败',e)
  }
}

//用blob请求一张图片
ajax2({
	url:'./images/1.jpg',
	responseType:'blob',
	form:document.getElementById('user'),
	timeout:3000,
	data:{
		author:"so",
		blog:"blog.redream.cn"
	},
	success:function(response){
		let img=document.createElement('img')
		//readAsDataURL(Blob|File)：返回一个基于Base64编码的data-uri对象。
		let reader = new FileReader();
		img=document.createElement('img')
		//需要监听转换完成，这里是异步的
		reader.onload = function (e) {
	    let dataURL = reader.result
	    img.src=dataURL
	    document.body.appendChild(img)
	  }
		reader.readAsDataURL(response)
		console.log(response)
	},
	progress:function(event){
		if (event.lengthComputable) {
      let completedPercent = event.loaded / event.total;
      console.log("progress",completedPercent)
    }
	},
	uploadProgress:function(event){
		if (event.lengthComputable) {
      let completedPercent = event.loaded / event.total;
      console.log("uploadProgress",completedPercent)
    }
	},
	error: function(e) {
	  console.log("onerror") 
	},
	ontimeout:function(e){
		console.log("ontimeout")
	}
})

function send(){
	ajax2({
	url:'http://localhost:3000/ajax',
	method:'get',
	// responseType:'blob',
	form:document.getElementById('user'),
	timeout:3000,
	data:{
		author:"so",
		blog:"blog.redream.cn"
	},
	success:function(response){
		console.log(response)
	},
	progress:function(event){
		if (event.lengthComputable) {
      let completedPercent = event.loaded / event.total;
      console.log("progress",completedPercent)
    }
	},
	uploadProgress:function(event){
		if (event.lengthComputable) {
      let completedPercent = event.loaded / event.total;
      console.log("uploadProgress",completedPercent)
    }
	},
	error: function(e) {
	  console.log("onerror") 
	},
	ontimeout:function(e){
		console.log("ontimeout")
	}
})
}

