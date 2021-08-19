//이 버젼은 3개의 테이블로 진행하는 버젼
// Barber_table, Customer_table, Reservation_table
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
  const user_bot_id = req.body.userRequest.user.id;
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

  else if (question === '역할 선택') {
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
	
  else if (question === '인적사항') { 
	// User의 인적사항 입력
	//const user_bot_id = req.body.userRequest.user.id;
	name = req.body.action.params.name
	identity = req.body.action.params.identity
	team = req.body.action.params.team
	
	// temporary DB
    //let userdata = [];
	//userdata.push(user_bot_id,name,identity,team);
	
  // var i = 0;
  // while(i<userdata.length){
  // console.log(userdata[i]);
  // i++;
  // }
	
	db.query('INSERT INTO users (user_bot_id,name,identity,team,reg_date) VALUES (?,?,?,?,NOW())',[user_bot_id,name,identity,team])

	answerdata = {
	  'version': '2.0',
	  'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': '이름 입력'
	      }
	    }],
	  }
	}
	res.json(answerdata); 
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
	  
	 	console.log(prefer_date.date); 	
	    console.log(prefer_time.from.time);
	    console.log(prefer_time.to.time);
	    console.log(prefer_num);
		//console.log(req.body.action.params.prefer_date)
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
	
  else if (question === '예약하기' || '네. 인적사항 이상무') {
	// 선호 이발병 선택 parameter
	prefer_barber = req.body.action.params.prefer_barber
	//console.log(prefer_barber);
	  //parameter를 가져오는 과정까지 이상 없음
    let user_team; //사용자의 팀 정보 선언
	db.query('SELECT team FROM users WHERE user_bot_id =?',[33333], function(error,result){
		if (error){
			throw error;
		}
		//console.log(result[0].team);\
		// user_team은 사용자의 소속부대를 추출하는 코드 차후 확장성 염두해 생성
		user_team = result[0].team;
		
		updated_barber_list = fs.readFile('barber_list.txt','utf-8', function(error,result){
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
				  "text": result
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


