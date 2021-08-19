const express = require('express');
const fs = require('fs'); //fs.write 및 fs.readfile 위한 모듈
const path = require('path')
const app = express();
var mysql = require('mysql');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()

const axios = require('axios');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin0408',
  database : 'node_kakaochatbot'
});
  
db.connect();

// 아래 db.query는 이발병 리스트 update해줌.. 임의로 실행
// db.query('SELECT name FROM users WHERE identity=?',['이발병'], function(error,result){
// 	if (error){
// 		throw error;
// 	}
// 	fs.writeFile('barber_list.txt','', function (err) {
// 	if (err) throw err;
// 	})	
// 	var i = 0;
// 	while (i<result.length){
// 		console.log(result[i].name);
// 		fs.appendFile('barber_list.txt',result[i].name + '\n ',function(err2)  //Separator로 ', ' 부여
// 		{
// 			if(err2){
// 				throw err2;
// 			}
// 		});
// 		i++;
// 	}
// });

// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/',express.static(__dirname + "/"));
var access_token = ''
var refresh_token = ''
const admin_key = '8a3ef3ab60b481be074c05e7cea0fa27'

app.get('/', (req, res) => {
  console.log(req.body)

  var raw_kakao_code = req._parsedOriginalUrl.href //인가코드
	// if 인가 코드가 존재한다면... -> 이것을 바탕으로 토큰을 얻는 request를 카카오 서버에 전송해야된다.
  // const token_request = JSON.stringify({grant_type:"authorization_code",client_id:	"70dd77ba1f896be751925091b51cd09c",redirect_uri:"https://jskakao.run.goorm.io",code:kakao_code})
  // console.log(token_request)
  kakao_code = raw_kakao_code.slice(7,raw_kakao_code.length)
  console.log(kakao_code)
  token_request(kakao_code)
  res.sendFile(path.join(__dirname,'/kakao_login.html'));
  //res.json(data);	
	
});

// Developers 포럼 답변 참고하여 formUrlEncoded 사용 - axios 사용하여 카카오 서버로 post request 보낼시 formUrlEncoded 사용 요망
const formUrlEncoded = x =>
    Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')

var token_request = function(kakao_code){
	axios.post('https://kauth.kakao.com/oauth/token',formUrlEncoded({
		grant_type:'authorization_code',
		client_id:'70dd77ba1f896be751925091b51cd09c',
		redirect_uri:'https://jskakao.run.goorm.io',
		code: kakao_code,
	})).then(function (response){
		console.log(response.data) // 토큰 request 이 후 얻은 response data printing
		access_token = response.data.access_token //액세스 토큰 할당
		refresh_token = response.data.refresh_token //리프레시 토큰 할당
		console.log(access_token)
		console.log(refresh_token)
	}).catch(err => {
		console.log(err)
	});
}


app.get('/friends_list', (req,res) => {
	dummy_data = '' //axios 규격을 맞추기 위한 dummy data
	
	// 로그인 사용자의 info 추출
	var user_info
	
	function user_info_request() {axios.post('https://kapi.kakao.com/v2/user/me',dummy_data,({
		headers:{
			Authorization: 'Bearer ' + access_token
		}
	})).then(function (response){
		console.log('loading user_info')
		user_info = response.data
		console.log(user_info)
	}).catch(err => {
		console.log(err)
	});
	}
	
	user_info_request()
	
	//로그인한 유저의 친구 리스트 request 
	
	function friends_list_request() {axios.get('https://kapi.kakao.com/v1/api/talk/friends',({
		headers:{
			Authorization: 'Bearer ' + access_token
		}
	})).then(function (response){
		console.log('loading friends_list')
		console.log(response.data)
		//console.log(response.data) // 토큰 request 이 후 얻은 response data printing
	}).catch(err => {
		console.log(err)
	});
	}
	
	friends_list_request()
	
	res.json('testing friends list request')
})

app.get('/send_msg_self' , (req,res) => {
	
	// var template_object={
	// "object_type": "text",
	// "text": "텍스트 영역입니다. 최대 200자 표시 가능합니다.",
	// "link": {
	// "web_url": "https://developers.kakao.com",
	// "mobile_web_url": "https://developers.kakao.com"
	// },
	// "button_title": "바로 확인"
	// }
	
	var temp_obj = {
        "object_type": "text",
        "text": "나에게 메세지 보내기 테스트.",
        "link": {
            "mobile_web_url": 'https://m.daum.net',
        },
        "button_title": "바로 ++ 확인"
    }
	
	var test_obj = {
		objectType: 'text',
		text:
		  '기본 템플릿으로 제공되는 텍스트 템플릿은 텍스트를 최대 200자까지 표시할 수 있습니다. 텍스트 템플릿은 텍스트 영역과 하나의 기본 버튼을 가집니다. 임의의 버튼을 설정할 수도 있습니다. 여러 장의 이미지, 프로필 정보 등 보다 확장된 형태의 카카오링크는 다른 템플릿을 이용해 보낼 수 있습니다.',
		link: {
		  mobileWebUrl: 'https://developers.kakao.com',
		  webUrl: 'https://developers.kakao.com',
		},
 	 }
	temp_obj = JSON.stringify(temp_obj)
	test_obj = JSON.stringify(test_obj)
	
	function send_msg_self() {axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send',formUrlEncoded({
		template_object:temp_obj
	}),({
		headers:{
			Authorization: 'Bearer ' + access_token
		}
	})).then(function (response){
		console.log('sending msg self')
		msg_result = response.data
		console.log(msg_result)
	}).catch(err => {
		console.log(err)
	})
	}
	send_msg_self()
	
	res.json('testing msg send')
	})

app.get('/send_msg_friend' , (req,res) => {
	
	// var template_object={
	// "object_type": "text",
	// "text": "텍스트 영역입니다. 최대 200자 표시 가능합니다.",
	// "link": {
	// "web_url": "https://developers.kakao.com",
	// "mobile_web_url": "https://developers.kakao.com"
	// },
	// "button_title": "바로 확인"
	// }
	
	var temp_obj = {
        "object_type": "text",
        "text": "Sending Text to Friend: Testing",
        "link": {
            "web_url": "https://developers.kakao.com",
            "mobile_web_url": "https://developers.kakao.com"
        },
        "button_title": "바로 확인"
    }
	
	temp_obj = JSON.stringify(temp_obj)
	
	function send_msg_self() {axios.post('https://kapi.kakao.com/v1/api/talk/friends/message/default/send',formUrlEncoded({
		receiver_uuids:'["mKCWoZiomqqbt4W1hb2NuIC4iaWTopKkkKX4"]',
		template_object:temp_obj
	}),({
		headers:{
			Authorization: 'Bearer ' + access_token
		}
	})).then(function (response){
		console.log('sending msg to friends')
		msg_result = response.data
		console.log(msg_result)
	}).catch(err => {
		console.log(err)
	})
	}
	send_msg_self()
	
	res.json('testing msg send to friends')
	})


// 챗봇 메세지 대응 페이지
app.post('/message', (req, res) => {
  const question = req.body.userRequest.utterance;
  const user_bot_id = req.body.userRequest.user.id;
  const goMain = '처음으로';
  let answerdata = '';
  let name;
  let identity;
  let team;
  let user_team;
  console.log(question);
  
  switch(question){
		  
	  case '테스트':
		
			answerdata = {
			'version': '2.0',
			'template': {
			'outputs': [{
			'simpleText': {
			'text': `테스트 성공! 사용자 봇ID는 ${user_bot_id}` + '\n' + 'https://jskakao.run.goorm.io/'
			}
			}],
			}
			}
			res.json(answerdata); 
			//userdata[0] = user_bot_id;
		  break;
		  
	  case '인적사항':
			// User의 인적사항 입력
			//const user_bot_id = req.body.userRequest.user.id;
			name = req.body.action.params.name
			identity = req.body.action.params.identity
			team = req.body.action.params.team

			//SELECT * FROM users WHERE IF(user_bot_id = '11111', "true", "false") = 'true';

			db.query('SELECT * FROM users WHERE IF(user_bot_id = ?, "true", "false") = "true"', [user_bot_id],function(err,result){
			answerdata = {
			'version': '2.0',
			'template': {
			'outputs': [{
			'simpleText': {
			'text': ``
			}
			}],
			}	
			}
			console.log(result)
			
			if (result.length == 0) { //if result exists
				db.query('INSERT INTO users (user_bot_id,name,identity,team,reg_date) VALUES (?,?,?,?,NOW())',	 [user_bot_id,name,identity,team], function(err,result){
				if (err) {
				throw err
				}
				res.json(answerdata)
					})
					}
			else {
				db.query('UPDATE users SET name = ?,identity = ?,team = ?,reg_date = NOW() WHERE user_bot_id = ?',	[name,identity,team,user_bot_id],function(err,result){
				if (err) {
				throw err
				}
				res.json(answerdata)
				})
					}
			});

			// db.query('INSERT INTO users (user_bot_id,name,identity,team,reg_date) VALUES (?,?,?,?,NOW())',			  [77777,name,identity,team])
		  break;
		  
	  case '아니요. 인적사항 재입력':
			answerdata = {
			'version': '2.0',
			'template': {
			'outputs': [{
			'simpleText': {
			'text': ``
			}
			}],
			}	
			}
			db.query('DELETE FROM users WHERE user_bot_id =?',[user_bot_id]);
			res.json(answerdata); 
		  break;
		  
	  case '(이발병) 예약조건 설정':

			let prefer_date = req.body.action.params.prefer_date;
			let prefer_time = req.body.action.params.prefer_time;
			let prefer_num = req.body.action.params.prefer_num;

			console.log('예약조건 설정 parameter');

			prefer_date = JSON.parse(prefer_date)
			prefer_time = JSON.parse(prefer_time)

			let p_date = prefer_date.date
			let p_from = prefer_time.from.time
			let p_to = prefer_time.to.time
			let p_num = prefer_num
			// 기존의 barber_preference 가 존재한다면 update 하는 걸로 바꿔줘야... 아니면 기록하는 식으로 나둚?
			db.query('SELECT * FROM barber_preference WHERE IF(barber_bot_id = ?, "true", "false") = "true"', [user_bot_id],function(err,result){
				console.log(result);
				if (result.length == 0){
				db.query('INSERT INTO barber_preference (barber_bot_id, prefer_date, time_from, time_to, prefer_num,reg_date) VALUES (?,?,?,?,?,NOW())',[user_bot_id,p_date,p_from,p_to,p_num],function(err,result){
					answerdata = {
					'version': '2.0',
					'template': {
					'outputs': [{
					'simpleText': {
					'text': '선호날짜 : ' + p_date +'\n' + '선호시간대 : ' + p_from + ' ~ ' + p_to +'\n' + '선호 인원수 : ' + p_num +'\n'
					}
					}],
					}
					}
					res.json(answerdata); 	
				})
				}
				
				else{
				db.query('UPDATE barber_preference SET prefer_date = ?, time_from = ?, time_to = ?, prefer_num = ?, reg_date = NOW() WHERE barber_bot_id = ?',[p_date,p_from,p_to,p_num,user_bot_id],function(err,result){
					console.log(result)
					answerdata = {
					'version': '2.0',
					'template': {
					'outputs': [{
					'simpleText': {
					'text': '선호날짜 : ' + p_date +'\n' + '선호시간대 : ' + p_from + ' ~ ' + p_to +'\n' + '선호 인원수 : ' + p_num +'\n'
					}
					}],
					}
					}
					res.json(answerdata);
				})					
				}
			})
		 break;
		  
	  case '선호사항 선택':
			 prefer_barber = req.body.action.params.prefer_barber;
			 special_message = req.body.action.params.special_message;
				 if (special_message == '없음'){
					special_message = 'NULL';
				 }
			   //다시 선택 응답으로 이 블록에 왔으면 DELETE db query Send!
				 if (question ==='다시 선택') {
					 db.query('DELETE FROM reservations WHERE customer_bot_id =?',[user_bot_id]);
				 }
			 db.query('SELECT * FROM users WHERE (name = ? AND identity = ?)',[prefer_barber,'이발병'], function(error1,result1){
				 if (error1){
					 throw error1;
				 }
				 console.log(typeof(result1[0].user_bot_id)) // 이발병의 고유 카카오톡 봇 아이디
				 console.log((result1[0].user_bot_id)) // 이발병의 고유 카카오톡 봇 아이디
				 
				 db.query('SELECT prefer_date,time_from,time_to,prefer_num FROM barber_preference WHERE barber_bot_id = ?',[result1[0].user_bot_id], function(err2, result2){
					 let prefer_data = result2[0]
					 console.log(prefer_data)
					 console.log(prefer_data.prefer_date)
					 let prefer_date = prefer_data.prefer_date
					 let prefer_time_from = prefer_data.time_from
					 let prefer_time_to = prefer_data.time_to
					 let prefer_num = prefer_data.prefer_num
					 console.log(prefer_date,prefer_time_from,prefer_time_to,prefer_num)
					 // DB side Reservations_Table에 보내는 DB Query
					 db.query('INSERT INTO reservations(customer_bot_id,prefer_barber,special_message) VALUES (?,?,?)',[user_bot_id,prefer_barber,special_message]);
					 answerdata = {
					  'version': '2.0',
					  'template': {
						'outputs': [{
						  'simpleText': {
							'text': '선호 날짜 : ' + prefer_date + '\n' + '선호 시간 : ' + prefer_time_from + '~' + prefer_time_to + '\n' + '선호 인원 : ' + prefer_num 
						  }
						}],
							"quickReplies": [
								{
								"messageText": "예약 완료",
								"action": "message",
								"label": "예약 완료"
								},
								{
								"messageText": "다시 선택",
								"action": "message",
								"label": "다시 선택"
								}
								]
					  }	
					}
					res.json(answerdata);  
				 })
			 });
		  break;
		  
	  case '다시 선택':
		  	 prefer_barber = req.body.action.params.prefer_barber;
			 special_message = req.body.action.params.special_message;
				 if (special_message == '없음'){
					special_message = 'NULL';
				 }
			   //다시 선택 응답으로 이 블록에 왔으면 DELETE db query Send!
				 if (question ==='다시 선택') {
					 db.query('DELETE FROM reservations WHERE customer_bot_id =?',[user_bot_id]);
				 }
			 db.query('SELECT * FROM users WHERE (name = ? AND identity = ?)',[prefer_barber,'이발병'], function(error1,result1){
				 if (error1){
					 throw error1;
				 }
				 console.log(typeof(result1[0].user_bot_id)) // 이발병의 고유 카카오톡 봇 아이디
				 db.query('SELECT prefer_date,time_from,time_to,prefer_num FROM barber_preference WHERE barber_bot_id = ?',[result1[0].user_bot_id], function(err2, result2){
					 console.log(result2[0])
					 let prefer_data = result2[0]
					 let prefer_date = prefer_data.prefer_date
					 let prefer_time_from = prefer_data.time_from
					 let prefer_time_to = prefer_data.time_to
					 let prefer_num = prefer_data.prefer_num
					 console.log(prefer_date,prefer_time_from,prefer_time_to,prefer_num)
					 // DB side Reservations_Table에 보내는 DB Query
					 db.query('INSERT INTO reservations(customer_bot_id,prefer_barber,special_message) VALUES (?,?,?)',[user_bot_id,prefer_barber,special_message]);
					 answerdata = {
					  'version': '2.0',
					  'template': {
						'outputs': [{
						  'simpleText': {
							'text': '선호 날짜 : ' + prefer_date + '\n' + '선호 시간 : ' + prefer_time_from + '~' + prefer_time_to + '\n' + '선호 인원 : ' + prefer_num 
						  }
						}],
							"quickReplies": [
								{
								"messageText": "예약 완료",
								"action": "message",
								"label": "예약 완료"
								},
								{
								"messageText": "다시 선택",
								"action": "message",
								"label": "다시 선택"
								}
								]
					  }	
					}
					res.json(answerdata);  
				 })
			 });
		  
		  break;
	  
	  case '(고객병) 예약 취소':
		  
		db.query('DELETE FROM reservations WHERE customer_bot_id = ?',[user_bot_id])
		answerdata = {
		"version": "2.0",
		"template": {
		"outputs": [
		  {
			"simpleText": {
			  "text": '예약이 취소되었습니다.'
			}
		  }
		]
		}
		}
		res.json(answerdata); 		  
		  
		  break;
		  
		  
	  case '(고객병) 예약하기': //선택가능한 이발병들 리스트 출력하는 채팅 블로
	
		db.query('SELECT team FROM users WHERE user_bot_id =?',[33333], function(error,result){
			if (error){
				throw error;
			}
			//console.log(result[0].team);\
			// user_team은 사용자의 소속부대를 추출하는 코드 차후 확장성 염두해 생성
			user_team = result[0].team;

			fs.readFile('barber_list.txt','utf-8', function(error,result){
				if (error){
					throw error;
				}
				// console.log(result)

				answerdata = {
				"version": "2.0",
				"template": {
				"outputs": [
				  {
					"simpleText": {
					  "text": '선택가능한 이발병 : ' + '\n' + result + '\n' 
					}
				  }
				],
				"quickReplies": [
				  {
					"messageText": "선호사항 선택",
					"action": "message",
					"label": "선호사항 선택"
				  },
				]
				}
				}
				res.json(answerdata); 
			})

		   });
		  break;
		  
	  case '네. 인적사항 이상무':
		
		db.query('SELECT team FROM users WHERE user_bot_id =?',[33333], function(error,result){
			if (error){
				throw error;
			}
			//console.log(result[0].team);\
			// user_team은 사용자의 소속부대를 추출하는 코드 차후 확장성 염두해 생성
			user_team = result[0].team;

			fs.readFile('barber_list.txt','utf-8', function(error,result){
				if (error){
					throw error;
				}
				// console.log(result)

				answerdata = {
				"version": "2.0",
				"template": {
				"outputs": [
				  {
					"simpleText": {
					  "text": '선택가능한 이발병 : ' + '\n' + result + '\n' 
					}
				  }
				],
				"quickReplies": [
				  {
					"messageText": "선호사항 선택",
					"action": "message",
					"label": "선호사항 선택"
				  },
				]
				}
				}
				res.json(answerdata); 
			})

		   });	  
		  break;
		  
	  case '예약 완료':
			answerdata = {
			'version': '2.0',
			'template': {
			'outputs': [{
			'simpleText': {
			'text': `예약이 완료되었습니다. 이발병이 준비되면 카톡이 전송될 것 입니다.`
			}
			}],
			}
			}
			res.json(answerdata); 
			//userdata[0] = user_bot_id;
		  break;
		  
  }
 
 console.log('loop once called')

});


app.listen(80, () => console.log('node on 80'));


