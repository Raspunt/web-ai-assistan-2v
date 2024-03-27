package logsender

import (
	"log"
	"net/http"
	"os"
)

func SendMessage(data string) {
	req, err := http.NewRequest("GET", os.Getenv("LOG_SERVER_URL")+"/show", nil)
	if err != nil {
		log.Print(err)
		os.Exit(1)
	}

	q := req.URL.Query()
	q.Add("data", data)
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	// body, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// fmt.Println(string(body))

}
