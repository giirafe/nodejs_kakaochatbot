const express = require('express');
const fs = require('fs'); //fs.write 및 fs.readfile 위한 모듈
const path = require('path')
const app = express();
var mysql = require('mysql');
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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/keyboard', (req, res) => {
  const data = {'type': 'text'}
  res.json(data);	
});



app.post('/message', (req, res) => {
  const question = req.body.userRequest.utterance;
  let user_bot_id = req.body.userRequest.user.id;
  const goMain = '처음으로';
  let answerdata = '';
  let name;
  let identity;
  let team;
	
  console.log(question);
  
  if (question === '테스트') {
	answerdata = {
	  'version': '2.0',
	  'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': `테스트 성공! 사용자 봇ID는 ${user_bot_id}`
	      }
	    }],
	  }
	}
	res.json(answerdata); 
	//userdata[0] = user_bot_id;
  }
	
  else if (question === '인적사항') { 
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
		if (result.length == 0) { //if result exists
			db.query('UPDATE users SET name = ?,identity = ?,team = ?,reg_date = NOW() WHERE user_bot_id = ?',			[name,identity,team,user_bot_id],function(err,result){
				if (err) {
					throw err
				}
				res.json(answerdata)
			})
			
		}
		else {
			db.query('INSERT INTO users (user_bot_id,name,identity,team,reg_date) VALUES (?,?,?,?,NOW())',			  [user_bot_id,name,identity,team], function(err,result){
				if (err) {
					throw err
				}
				res.json(answerdata)
			})		
		}
	});
	  
	  // db.query('INSERT INTO users (user_bot_id,name,identity,team,reg_date) VALUES (?,?,?,?,NOW())',			  [77777,name,identity,team])
	  
   }

   else if (question === '아니요. 인적사항 재입력') {
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
  }
	
  else if (question === '(이발병)예약조건 설정') {
	  	
		let prefer_date = req.body.action.params.prefer_date;
		let prefer_time = req.body.action.params.prefer_time;
		let prefer_num = req.body.action.params.prefer_num;
		console.log(req.body.action.params);
	  
	    console.log('예약조건 설정 parameter');
	  	
	    prefer_date = JSON.parse(prefer_date)
	    prefer_time = JSON.parse(prefer_time)
	  
	  	let p_date = prefer_date.date
	  	let p_from = prefer_time.from.time
		let p_to = prefer_time.to.time
		let p_num = prefer_num
		// 기존의 barber_preference 가 존재한다면 update 하는 걸로 바꿔줘야... 아니면 기록하는 식으로 나둚?
	    db.query('INSERT INTO barber_preference (barber_bot_id, prefer_date, time_from, time_to, prefer_num,reg_date) VALUES (?,?,?,?,?,NOW())',[user_bot_id,p_date,p_from,p_to,p_num])
		answerdata = {
		  'version': '2.0',
		  'template': {
			'outputs': [{
			  'simpleText': {
				'text': '예약조건 testing'
			  }
			}],
		  }
		}
		res.json(answerdata); 
	  }

   else if (question === '선호사항 선택' || '다시 선택') {
	 prefer_barber = req.body.action.params.prefer_barber;
	 special_message = req.body.action.params.special_message;
	 let user_bot_id = req.body.userRequest.user.id;
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
		 console.log(result1[0])
		 //console.log(typeof(result1[0].user_bot_id)) // 이발병의 고유 카카오톡 봇 아이디
		 db.query('SELECT prefer_date,time_from,time_to,prefer_num FROM barber_preference WHERE barber_bot_id = ?',[result1[0].user_bot_id], function(err2, result2){
			 console.log(result2[0])
			 let prefer_data = result2[0]
			 prefer_date = prefer_data.prefer_date
			 prefer_time_from = prefer_data.time_from
			 prefer_time_to = prefer_data.time_to
			 prefer_num = prefer_data.prefer_num
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
  	}


  else if (question === '예약하기' || '네. 인적사항 이상무') {
	
    let user_team; //사용자의 팀 정보 선언
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
 	 }

  else if (question === '예약 완료') {
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
  }	
	
  else { 
  	console.log('준비되지 않은 발화!');	
  }
  
  // 여기 json 부분이 reference error 발생 express의 json 미들웨어에 대한 조사 필요해 보임...
  // 6/25 answerdata 선언을 통해 reference error는 해결 but... res.json(answerdata)에서 문제 발생
  // 위 부분은 문제 없음
  // 카카오 오픈빌더에서 봇 응답을 = 스킬데이터 사용으로 설정을 안해놓고 배포해서 json 파일이 정상적으로 작동했음에도 챗봇에 출력이 안됐음
  
  //console.log(answerdata);
  //console.log('testing');
  //console.log(question);
	
  //res.json(answerdata); 

 console.log('loop once called')

});





app.listen(3000, () => console.log('node on 3000'));


