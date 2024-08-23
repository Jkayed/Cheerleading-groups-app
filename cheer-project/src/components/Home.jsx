import ShowLocalGroups from "./showLocalGroups";
import axios from 'axios';
function Home() {
  function testDatabase() {
    axios.post('http://localhost:3000/contact', {
      firstName: "Test",
      lastName: "Test",
      email: "Test",
      phone: "Test",
      country: "Test",
      city: "Test",
      state: "Test",
      zip: "Test",
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  return (
    <>
 <button onClick={testDatabase}>Test</button>
    </>
  );
}

export default Home;
