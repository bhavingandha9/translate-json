Pure NodeJS server to translate a JSON object values to the different language using google translate api.

Example Request JSON:
```sh
{
	"countryCode":"ES",
	"data": {
		"thanks":"thank you",
		"goodbye": "Good Bye"
	},
  "resUnflat": true
}
```

Example Response JSON:
```sh
{
  "thanks":"Gracias",
  "goodbye": "Adiós"
}
```

[Link](https://cloud.google.com/translate/docs/languages) for supported Languages and Codes.

Give resUnflat to true if response need as unflatten object

**You have to export google cloud service account json path to GOOGLE_APPLICATION_CREDENTIALS env variable.**