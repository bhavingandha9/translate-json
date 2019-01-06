Pure NodeJS server to translate a JSON object keys to the different language using google translate api.

Example Request JSON:
```sh
{
	"countryCode":"ES",
	"data": {
		"thanks":"thank you",
		"goodbye": "Good Bye"
	}
}
```