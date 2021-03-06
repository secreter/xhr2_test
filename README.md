# 用XMLHttpRequest2的formdata来发送ajax

#### 今天自己简单实现了一下ajax和jsonp的封装，心血来潮想尝试一下XMLHttpRequest2的新特性，其实xhr也不算很新，浏览器兼容问题已经不多了（[查看caniuse][1]），只是平时很少去自己封装。加上最近想把h5的新特性都写写一下看看。初次学习，多多包涵。

 ### 搭建服务器
 1. 为什么要搭建服务器呢，因为ajax请求受[同源策略][2]限制，在本地搭建服务器可以方便调试。
 2. 不过xhr2里是可以通过配置服务器响应头来允许跨域的，需要
 3. Access-Control-Allow-Origin: *|域名，今天先不讨论服务器配置，具体可以看[MDN文档][3]
 4. 最简单的搭建服务器的方法就是用express，虽然我有apache服务器，但为了学习node，还是自己搭建了express，学习成本不高，一天足够了，可以看[官方文档][4]和[阮老师的文档][5]
 5. 安装express
    $ npm install express --save
 6. 大家可以下载我的代码，里面已经包含了配置好的服务器
    $ npm install
 7. 另外要说的一点就是，express里默认不支持formdata，而我们本次实验就想体验formdata和blob发送ajax，所以我们需要安装一个中间件[multer][6]，一个用来接收formdata和blob的中间件
    $ npm install --save multer
  配置也很简单，全都在代码routes/ajax里面,我都做了注释
   

     var multer  = require('multer')
        //存储文件对象
        var storage = multer.diskStorage({
          destination: function (req, file, cb) {
          	//存储地址
            cb(null, 'uploads/')
          },
          filename: function (req, file, cb) {
          	//文件命名
            cb(null, file.fieldname + '-' + Date.now() + file.originalname.slice(-4))
          }
        })
        
        var upload = multer({ storage: storage })
        /* GET ajax page. */
        router.get('/',upload.any(), function(req, res, next) {
          // res.send('Got a GET request');
          res.send({so: 'fan',data:req.query});
        });

 ###  代码目录介绍
 <pre>
 > --public      静态资源
 >  |--images   
 >  |--JavaScript
 >    |--net.js       xhr2封装的ajax
 > --routes             路由文件
 >  |--ajax.js   测试post，get，head等请求的，大家可以随便配置
 > --uploads      接收上传文件的目录
 > --views     html模板文件
 </pre>
 ### XMLHttpRequest2介绍
1. 属性
* onreadystatechange：当readyState改变时触发，和xhr1一样
* readyState：有0（此时xhr对象被成功构造，open()方法还未被调用）,1（open()方法已被成功调用，send()方法还未被调用。注意：只有xhr处于OPENED状态，才能调用xhr.setRequestHeader()和xhr.send(),否则会报错）,2（send()方法已经被调用, 响应头和响应状态已经返回）,3（响应体(response entity body)正在下载中，此状态下通过xhr.response可能已经有了响应数据）,4（	整个数据传输过程结束，不管本次请求是成功还是失败）种状态
* timeout：设置超时时间（ms）
* upload：上传对象，除了没有 onreadystatechange方法和XMLHttpRequest2方法属性一样，都继承XMLHttpRequestEventTarget
* withCredentials ：跨域时默认false，必须设置为true才能发送如"cookies"和"HTTP authentication schemes"等认证消息
2. 方法
abort() ：调用后主动终止发送请求
getResponseHeader() ：获取响应头
3. 继承
XMLHttpRequestEventTarget
EventTarget
Events
loadstart：调用xhr.send()方法后立即触发，若xhr.send()未被调用则不会触发此事件。
progress：xhr.upload.onprogress在上传阶段(即xhr.send()之后，xhr.readystate=2之前)触发，每50ms触发一次；xhr.onprogress在下载阶段（即xhr.readystate=3时）触发，每50ms触发一次。
abort：当调用xhr.abort()后触发
error：只有发生了网络层级别的异常才会触发此事件
load：当请求成功完成时触发，此时xhr.readystate=4
timeout：超时触发
loadend：请求结束触发，不管失败还是成功
readystatechange：状态改变触发
4. 更多详细结束请参考[MDN][7]和[你真的会使用XMLHttpRequest吗？][8]

### 代码封装
仿照jquery的形式，自己封装了一个简单的用xhr2请求数据的ajax，支持的responseType有"",text,blob,document,json,arrayBuffer。而且非get请求，都使用[formdata][9]来发送数据，十分方便，你可以直接传入一个form对象，就能发送所有数据，包括文件。因为formdata不支持get请求，所以get请求还是使用传统的发送方式。代码如下：

  

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

### 读取blob数据
<pre>
例子里我是读取一张图片，有两种方法：
1. readAsDataURL（）

let reader = new FileReader();
		img=document.createElement('img')
		//需要监听转换完成，这里是异步的
		reader.onload = function (e) {
	    let dataURL = reader.result
	    img.src=dataURL
	    document.body.appendChild(img)
	  }
		reader.readAsDataURL(response)
2. objectURL = [URL.createObjectURL(blob)][10]
</pre>
> 大家有空的话可以安装了跑一跑，自己动手记忆深刻，当然，有的高级功能我这次还没涉及到，不过有了这个框架，做实验就方便了。
https://github.com/secreter/xhr2_test


  [1]: http://caniuse.com/#search=XMLHttpRequest
  [2]: https://developer.mozilla.org/en/Same_origin_policy_for_JavaScript
  [3]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
  [4]: http://expressjs.com/zh-cn/
  [5]: http://javascript.ruanyifeng.com/nodejs/express.html
  [6]: https://github.com/expressjs/multer
  [7]: https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
  [8]: https://segmentfault.com/a/1190000004322487#articleHeader13
  [9]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/Using_FormData_Objects
  [10]: https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL