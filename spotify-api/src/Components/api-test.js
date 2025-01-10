import React, { useEffect, useState} from 'react';

function ApiTest(){

    const [data, setData] = useState("null");

    const fetchData = () => {
        fetch("http://localhost:3001/api")
        .then((response) => response.json())
        .then((data) => setData(data.message))
        .catch((error) => console.error("Error fetching data:", error));
    }


    return (
        <div>
            <h1>Data from server:</h1>
            <button onClick={fetchData}>Fetch Data</button>
            {data && (
                <pre>{data}</pre>
            )}
        </div>
    )
}

export default ApiTest