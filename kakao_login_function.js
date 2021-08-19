	
	function loginwithKakao(){
		
		console.log('Kakao Login Start')
		// SDK를 초기화 합니다. 사용할 앱의 JavaScript 키를 설정해 주세요.
		Kakao.init('74e5998a2ec9e64ac7a39c401d8624ea');
		// SDK 초기화 여부를 판단합니다.
		console.log(Kakao.isInitialized());

		Kakao.Auth.authorize({
		  redirectUri: 'https://jskakao.run.goorm.io/'
		});

		displayToken()

		  function displayToken() {
			const token = getCookie('authorize-access-token')
			if(token) {
			  Kakao.Auth.setAccessToken(token)
			  Kakao.Auth.getStatusInfo(({ status }) => {
				if(status === 'connected') {
				  document.getElementById('token-result').innerText = 'login success. token: ' + Kakao.Auth.getAccessToken()
				} else {
				  Kakao.Auth.setAccessToken(null)
				}
			  })
			}
		  }

		   function getCookie(name) {
			 const value = "; " + document.cookie;
			 const parts = value.split("; " + name + "=");
			 if (parts.length === 2) return parts.pop().split(";").shift();
		   }
	}
		