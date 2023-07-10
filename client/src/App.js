import axios from 'axios';
import './App.css';
import React, {useState} from 'react';

function App() {
  // State variables for code and output
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");

  // Function to handle form submission
  const handleSubmit = async () => {
    const payload = {
      language,
      code
    };
    try {
      // Make a POST request to the backend server
      const { data } = await axios.post("http://localhost:5000/run", payload);
      // Update the output state with the response data
      setOutput(data.output);
    } catch (err) {
      console.log(err.response);
    }
  };

  // Render the component
  return (
    <div className="App">
      <h1>ONLINE CODE COMPILER</h1>
      <div>
        <label>Language: </label>
        <select 
          value={language} 
          onChange={(e) => {
            setLanguage(e.target.value);
            }}>
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <br></br>
      <textarea rows="20" cols="75" value={code} onChange={(e) => setCode(e.target.value)}></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <br />
      <p>{output}</p>
    </div>
  );
}


export default App;
