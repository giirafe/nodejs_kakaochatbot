
# 국군장병들을 위한 부대 내 이발 예약 챗봇

## 프로젝트 소개
* 육군 장병들은 두발규정을 준수하기 위해 정기적으로 부대 내에서 이발병들에게 이발을 시행합니다.
* 이발병들에게 구두로 예약을 하고 정해진 시간에 이발 장소를 가 이발을 하는 프로세스로 이뤄지는데 **다음 이발 순서의 장병**을 찾기 위해서 방금 이발을 끝낸 장병이 직접 찾아가 이발 순서를 알려주거나 카톡, 전화 등의 수단을 이용해 해당 장병에게 연락을 합니다.
* 필자는 기존의 방법이 매우 번거롭고 비효율적이라고 생각되어 **부대 내 이발 예약 챗봇**을 구상하게 되었습니다. 

## 기능 구상
* 이발병과 고객병 모드 구분
* 초기 사용자의 인적사항 기입 및 인적사항 변경
* 사회에서는 고객이 우선시되어 있지만 부대 내에서는 이발병들의 여건이 우선시 되기에 이발병 중심의 서비스 구성
* 이발병이 이발 가능한 시간대 설정
* 고객병들은 자신이 선호하는 이발병을 선택 및 변경 가능
* 예약 성공 여부 전달

## 🔨기술 스택
### Server(back-end)
<table>
 <tr>
  <td><a href='https://nodejs.org/ko/'><img src='https://user-images.githubusercontent.com/40621030/136699173-a5a2e626-9161-4e30-85fd-93898671896e.png' height=80/></a></td>
  <td><a href='https://www.mysql.com/'><img src='https://user-images.githubusercontent.com/40621030/136699174-e540729d-0092-447c-b672-dfa5dcfd41a7.png' height=80/></a></td>
  <td><a href='https://www.goorm.io//'><img src='https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/uifol9klj1ht0squxhje' width = 200 height=120/></a></td>
 </tr>
 <tr>
  <td align='center'>Node js</td>
  <td align='center'>MySQL</td>
  <td align='center'>Goorm Server Deploy</td>
 </tr>
</table>

# Check List
- Need a Kakao Developers account and create a Kakao application for this chatbot
