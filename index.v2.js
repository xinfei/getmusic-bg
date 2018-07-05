const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const cheerio = require("cheerio");
const querystring = require('querystring');
const zlib = require('zlib');
const fs = require('fs');// 文件处理模块
const path = require('path');
const mineType = require('mime-types');
const requestdown = require("request");
var urlencode = require('urlencode');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({extended: false});

//设置跨域访问
app.all('*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//数据接口
// 获取默认歌曲列表
app.get('/kugou/hotlist', urlencodedParser, function(request, response){
    // 输出 JSON 格式
    let reqData = {
        'page': request.query.page,
        'size': request.query.size
    };
    // console.log(reqData)
    // let url = `http://songsearch.kugou.com/song_search_v2?callback=jQuery191034642999175022426_1489023388639&keyword={}&page=1&pagesize=30&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0&_=1489023388641`
    // console.log(reqData)
    let data = {
        'callback': 'jQuery191034642999175022426_1489023388639',
        'keyword': '{}',
        'page': reqData.page,
        'pagesize': reqData.size,
        'userid': '-1',
        'clientver': '',
        'platform': 'WebFilter',
        'tag': 'em',
        'filter': '2',
        'iscorrection': '1',
        'privilege_filter': '0',
        '_': '1489023388641'
    }
    // console.log(data)
    //抓取页面
    var content = querystring.stringify(data);

    var resData = ''
    // console.log(content)
    var options = {
        hostname: 'songsearch.kugou.com',
        port: 80,
        path: '/song_search_v2?' + content,
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': 'kg_mid=86b852c82e6d0db34caaa7878649a7e7; Hm_lvt_aedee6983d4cfc62f509129360d6bb3d=1525242675,1525404250,1526518873,1526518882',
            'Host': 'songsearch.kugou.com',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
    };
    var req = http.get(options, function(res){
        var html = '', output;
        if(res.headers['content-encoding'] == 'gzip'){
            var gzip = zlib.createGunzip();
            res.pipe(gzip);
            output = gzip;
        } else{
            output = res;
        }
        output.on('data', (data) =>{
            data = data.toString('utf-8');
            html += data;
        });
        output.on('end', () =>{
            html = html.replace(/jQuery191034642999175022426_1489023388639/, "");
            html = html.substring(1);
            html = html.substring(0, html.length - 2);
            resData = html;
            response.send(resData);
        });
    });
    req.on('error', function(e){
        console.log('problem with request: ' + e.message);
    });
    req.end();
});

// 酷狗接口-通过关键词获取歌曲列表
app.post('/kugou/list', urlencodedParser, function(request, response){
    // 输出 JSON 格式
    let reqData = {
        'page': request.body.page,
        'size': request.body.size,
        'name': request.body.name ? request.body.name : ''
    };
    let url = `http://songsearch.kugou.com/song_search_v2?callback=jQuery191034642999175022426_1489023388639&keyword={戒烟}&page=1&pagesize=30&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0&_=1489023388641`
    // console.log(reqData)
    let data = {
        'callback': 'jQuery191034642999175022426_1489023388639',
        'keyword': '{' + reqData.name + '}',
        'page': reqData.page,
        'pagesize': reqData.size,
        'userid': '-1',
        'clientver': '',
        'platform': 'WebFilter',
        'tag': 'em',
        'filter': '2',
        'iscorrection': '1',
        'privilege_filter': '0',
        '_': '1489023388641'
    }
    // console.log(data)
    //抓取页面
    var content = querystring.stringify(data);

    var resData = ''
    // console.log(content)
    var options = {
        hostname: 'songsearch.kugou.com',
        port: 80,
        path: '/song_search_v2?' + content,
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': 'kg_mid=86b852c82e6d0db34caaa7878649a7e7; Hm_lvt_aedee6983d4cfc62f509129360d6bb3d=1525242675,1525404250,1526518873,1526518882',
            'Host': 'songsearch.kugou.com',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
    };
    var req = http.get(options, function(res){
        var html = '', output;
        if(res.headers['content-encoding'] == 'gzip'){
            var gzip = zlib.createGunzip();
            res.pipe(gzip);
            output = gzip;
        } else{
            output = res;
        }
        output.on('data', (data) =>{
            data = data.toString('utf-8');
            html += data;
        });
        output.on('end', () =>{
            html = html.replace(/jQuery191034642999175022426_1489023388639/, "");
            html = html.substring(1);
            html = html.substring(0, html.length - 2);
            resData = html;
            response.send(resData);
        });
    });
    req.on('error', function(e){
        console.log('problem with request: ' + e.message);
    });
    req.end();
});

// 酷狗接口-通过歌曲hash值获取歌曲地址
app.post('/kugou/music', urlencodedParser, function(request, response){
    // 输出 JSON 格式
    // console.log(request)
    let reqData = {
        'fileHash': request.body.fileHash
    };
    // console.log(reqData)
    // let url = `http://songsearch.kugou.com/song_search_v2?callback=jQuery191034642999175022426_1489023388639&keyword={戒烟}&page=1&pagesize=30&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0&_=1489023388641`
    // console.log(reqData)
    let data = {
        'r': 'play/getdata',
        'hash': reqData.fileHash
    };
    // console.log(data)
    //抓取页面
    var content = querystring.stringify(data);

    var resData = ''
    // console.log(content)
    var options = {
        hostname: 'www.kugou.com',
        port: 80,
        path: '/yy/index.php?' + content,
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': 'kg_mid=86b852c82e6d0db34caaa7878649a7e7; Hm_lvt_aedee6983d4cfc62f509129360d6bb3d=1525242675,1525404250,1526518873,1526518882',
            'Host': 'www.kugou.com',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
    };
    var req = http.get(options, function(res){
        var html = '', output;
        if(res.headers['content-encoding'] == 'gzip'){
            var gzip = zlib.createGunzip();
            res.pipe(gzip);
            output = gzip;
        } else{
            output = res;
        }
        output.on('data', (data) =>{
            data = data.toString('utf-8');
            html += data;
        });
        output.on('end', () =>{
            resData = html;
            // var musicUrl = JSON.parse(resData).data.play_url;
            // var musicName = JSON.parse(resData).data.song_name;
            response.send(resData);
        });
    });
    req.on('error', function(e){
        console.log('problem with request: ' + e.message);
    });
    req.end();
});

// 酷狗接口-通过歌曲不同音质的hash值获取不同音质歌曲的url
app.get('/kugou/music', urlencodedParser, function(req, res){
    let reqData = req.query.fileHash
    requestdown('http://www.kugou.com/yy/index.php?r=play/getdata&hash='+reqData, function(error, response, body){
        if(!error && response.statusCode == 200){
            var $ = cheerio.load(body);
            var data = JSON.parse($('body').text()).data.play_url
            res.send(data)
        } else{
            console.log('请求失败：'+index);
        }
    })
})

// 酷狗接口-通过歌曲url发送歌曲文件
app.get('/kugou/sendmusic', urlencodedParser, function(request, response){
    // 输出 JSON 格式
    let reqData = {
        'musicUrl': request.query.musicUrl,
        'musicName': request.query.musicName
    };
    var musicUrl = reqData.musicUrl;
    var musicEnd = reqData.musicUrl.split('.')[4];
    // 创建文件夹目录
    var dirPath = path.join(__dirname, "downTemp");
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
        console.log("文件夹创建成功");
    } else{
        // console.log("文件夹已存在");
    }
    // 下载
    let fileName = reqData.musicName + '.' + musicEnd;
    let url = musicUrl;
    let stream = fs.createWriteStream(path.join(dirPath, fileName));
    requestdown(url).pipe(stream).on("close", function(err){
        console.log("文件[" + fileName + "]下载完毕");
        // let filePath = dirPath + '\\' + fileName; //window系统路径
        let filePath = dirPath + '/' + fileName;    //linux系统路径
        response.attachment(fileName);
        response.download(filePath, fileName, function(err){
            if(err){
                //处理错误，可能只有部分内容被传输，所以检查一下res.headerSent
            } else{
                //下载成功后删除服务器上的文件
                fs.unlink(filePath, function(err){
                    if(err) return console.log(err);
                    console.log('文件删除成功');
                })
            }
        });
    });
});


//配置服务端口
var server = app.listen(8083, function(){

    var host = server.address().address;

    var port = server.address().port;

    console.log(`Example app listening at http://${host}:${port}`);
})
