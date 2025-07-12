//import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React, { useEffect, useState, useRef , useCallback } from 'react' ;
import { FaEdit, FaPlus, FaCode, FaTrash, FaDownload, FaCopy } from 'react-icons/fa';
import { BiSelectMultiple } from "react-icons/bi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import ImportFromSwagger from './ImportFromSwagger';
import {camelCase} from  'change-case';

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div style={{ marginBottom: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <div
            onClick={onToggle}
            style={{
                background: '#f5f5f5',
                padding: '10px 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: isOpen ? '1px solid #ccc' : 'none',
            }}
        >
            {title}
            <span style={{ fontSize: '1.2em' }}>{isOpen ? '▴' : '▾'}</span>
        </div>
        {isOpen && (
            <div style={{ padding: 15 }}>
                {children}
            </div>
        )}
    </div>
);



function App() { 
const [serviceName, setServiceName] = useState("");
const [apiEndpoint, setApiEndpoint] = useState("");
const [requestType, setRequestType] = useState("GET");
const [headerKey, setHeaderKey] = useState("");
const [headerValue, setHeaderValue] = useState("");
const [headers, setHeaders] = useState ([]);
const [bulkHeaders, setBulkHeaders] = useState("");
const [requestBody, setRequestBody] = useState("");
const [responseBody, setResponseBody] = useState("");
const [errorResponseBody, setErrorResponseBody] = useState("");
const [responseCode, setResponseCode] = useState("200");
const [generatedCode, setGeneratedCode] = useState("");
const [stepDefinition, setStepDefinition] = useState("");
const [featureFile, setFeatureFile] = useState("");
const [isRequestBodyFormatted, setIsRequestBodyFormatted] = useState(false);



const useLineByLineCode = (fullCode, delay = 120) => {
const [visiblecode, setVisibleCode] = useState('');

useEffect (() => {
if (typeof fullCode !== 'string' || !fullCode.trim()) {
setVisibleCode('');
return;
}

const lines = fullCode
.split('\n')
.filter(line => typeof line === 'string' && line.trim() !== '');

let currentLine = 0;
let accumalatedCode = '';

const interval = setInterval (() => {
if (currentLine < lines.length) {
accumalatedCode += lines[currentLine] + '\n';
setVisibleCode(accumalatedCode);
currentLine++;
} else {
clearInterval(interval);
}
}, delay);

return () => clearInterval(interval);
}, [fullCode, delay]);

return visiblecode;
};



const visibleGeneratedCode = useLineByLineCode(generatedCode);
const visibleStepDefinition = useLineByLineCode(stepDefinition);
const visibleFeatureFile = useLineByLineCode(featureFile);


let templateTableString;
let exampleTableString;
let exampleErrorTablestring;
let userInputMap='';
let selectedCheckBoxes;

// Track view mode for each JASON field
const [viewMode, setViewMode] = useState({
request: 'edit',
response:'edit',
error: 'edit'
});


const [accordionState, setAccordionState] = useState({
requestBody: false,
successResponse: false,
errorResponse: false,
bulkHeaders: false,    

});


    const toggleAccordion = (section) => {
        setAccordionState(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

const [selectableRequestTree, setSelectableRequestTree] = useState({});
const [selectedRequestTree, setSelectedRequestTree] = useState({});


const addHeader = () => {
if (headerKey.trim() && headerValue.trim()) {
setHeaders([...headers, { key: headerKey.trim(), value: headerValue.trim() }]);
setHeaderKey("");
setHeaderValue("");
}
};

const bulkAddHeaders = () => {
if (bulkHeaders.trim()) {
const newHeaders = bulkHeaders
.split("\n")
.map((line) => line.trim())
.filter((line) => line.includes(":"))
.map((line) => {
const idx = line.indexOf(":");
return {
key: line.slice(0, idx). trim(),
value: line.slice(idx + 1).trim(),
};
});
setHeaders([...headers, ...newHeaders]);
setBulkHeaders("");
}
};

const clearAll = () => {
setServiceName("");
setApiEndpoint("");
setRequestType("GET");
setHeaderKey("");
setHeaderValue("");
setHeaders([]);
setBulkHeaders("");
setRequestBody("");
setResponseBody("");
setErrorResponseBody("");
setResponseCode("200");
setGeneratedCode("");
setStepDefinition("");
setFeatureFile("");
setIsRequestBodyFormatted(false);
setViewMode({
request: 'edit',
response: 'edit',
error: 'edit'
});
collapseAllSections();
};



const buildTree = (obj) => {
if (typeof obj !== 'object' || obj === null) return true; // leaf node
const tree = {};
for (const key in obj) {
tree[key] = buildTree(obj[key]);
}
return tree;
};

const formatJson = (jsonStr, setter, field) => {
try {
if (!jsonStr.trim()) {
Swal.fire({ 
icon: 'Warning',
title: 'Oops...',
text: 'Please enter JSON to format',
});
return;
}

const parsed = JSON.parse(jsonStr);
const pretty = JSON.stringify(parsed, null, 2);
setter(pretty);

if (field === 'request') {
setParsedRequestBody(parsed);

// Get all leaf paths (fields)
const allPaths = getAllFieldPaths (parsed);
setSelectableRequestTree(buildTree(parsed));
setSelectedRequestFields(allPaths); // all checked initially 
setIsRequestBodyFormatted(true);
}

setViewMode({ ...viewMode, [field]: 'view' });
} catch (e)  {
Swal.fire({
icon: 'error',
title: 'Invalid JSON',
text:  `please check your input. \n Error: ${e.message} `,
});
}
};



const toggleField = (key) => {
setSelectedRequestFields(prev => 
prev.includes(key) ? prev.filter(k => k !== key) : [...prev,key]
);
};

const toggleEditMode =  (field) => {
setViewMode({ ...ViewMode, [field]: 'edit' });
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const detectType = (value) => {
if (Array.isArray(value)) {
if (value.length === 0) return "List<Object>";
return "List<" + detectType(value[0]) + ">";
}
if (value === null) return "Object";
switch (typeof value) {
case 'number':
    return Number.isInteger(value) ? "int" : "double";
case "boolean":
return "boolean";
case "object":
return null;
default:
return "String";
}
};

function generateClass(name, jsonObj, indent = '   ') {
let classCode = `
@Data
public static class ${name} {\n`;
let nestedClasses = '';

for (const [key, value] of Object.entries(jsonObj)) {
    let type = detectType(value);

    
    if (type === null) {
        const nestedClassName = capitalize(key);
        const nestedCode = generateClass(nestedClassName, value, indent +'   ');
        type = nestedClassName;
        nestedClasses += '\n' + nestedCode.split('\n').map(line => indent + line).join('\n')+ '\n';
    } else if (type.startsWith("List<") && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        const nestedClassName = capitalize(key);
        const nestedCode = generateClass(nestedClassName, value[0],indent + '   ');
        type = `List<${nestedClassName}>`;
        nestedClasses += '\n' + nestedCode.split('\n').map(line => indent + line).join('\n') + '\n';
    }   
    if(name == "ErrorresponseData" && name === "SuccessResponseData") {
        classCode +=`
        @JsonProperty(value="${key}")
        ${indent}private ${type} ${camelCase(key)};\n`;
    }else{
        classCode += `${indent}private ${type} ${key};\n`;
    }

}

classCode += '\n' +nestedClasses+'}\n';

return classCode;
}

const generateCode = () => {
if (!serviceName.trim()) {
Swal.fire({
icon: 'error',
title: 'Missing Information',
text: 'please enter Service Name',
});
return;
}
if (!apiEndpoint.trim()) {
Swal.fire({
icon: 'error',
title: 'Missing Information',
text: 'please enter API Endpoint URL',
});
return;
}
if (!isRequestBodyFormatted){
Swal.fire({
icon: 'error',
title: 'Formatting Error',
text: 'please Format Request Body',
});
return;
}

let requestPojoClasses = {};
let responsePojoClasses = {};
let errorResponsePojoClasses = {};


const filterJsonBySelection = (obj, tree) => {
    if (typeof obj !== 'object' || obj === null || typeof tree !== 'object') return obj; 
    const result = {};
    for (const key in obj) {
    if (tree[key]) {
        if (typeof tree[key] === 'object') {
            result[key] = filterJsonBySelection(obj[key], tree[key]);
    } else {
        result[key] = obj[key];
    }
}
}
return result;
};

try {
// const rawRequestObj = Json.parse(requestBody);
const rawRequestObj = JSON.parse(requestBody);
requestPojoClasses = generateClass("RequestBody", rawRequestObj);
const isPathSelected = (path) => selectedRequestFields.includes(path);
const extractDefaultsBySelectedFields = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) {
    // Leaf node, return if selected 
    if (isPathSelected(path)) return obj;
    return undefined;
}

// Object node
const result = Array.isArray(obj) ? [] : {};
for (const key in obj) {
const fullpath = path ? '${path}.${key}' : key;
const filteredValue = extractDefaultsBySelectedFields(obj[key], fullpath );
if (filteredValue !== undefined) {
result[key] = filteredValue;
}
}

// If result is empty object/array, return undefined to exclude it 
if (
(Array.isArray(result) && result.length === 0) ||
(typeof result === 'object' && Object.keys(result).length === 0)
) {
return undefined;
}

return result;
};
const selectedDefaults = extractDefaultsBySelectedFields(rawRequestObj);
console.log("Defaults to apply from selection:", selectedDefaults);

function flattenJson(obj, prefix = '') {
    const result = {};
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof Value === 'object' && value !== null && !Array.isArray(value)){
        
            Object.assign(result, flattenJson(value, newKey));

} else {
    if(value=="")
    {
        result[newKey] = '<Add'+newKey+'here>';
    }
    else{
    result[newKey] = value;
    }
}
    }
return result;
}

function formatJsonToTable(inputJson) {
const flatJson = flattenJson(inputJson);
const headers = Object.keys(flatJson);
const placeholders = headers.map(key => `<${key}>`);
return `|${headers.join("|")}|\n|${placeholders.join("|")}|`;
}

function formatJsonToExample(inputJson) {
const flatJson = flattenJson(inputJson);
const headers = Object.keys(flatJson);
const values = Object.values(flatJson);
return `|${headers.join("|")}|\n|${values.join("|")}|`;
}

function formatJsonToErrorExample(inputJson) {
const flatJson = flattenJson(inputJson);
// const headers = object.keys(flatJson);
const headers = Object.keys(flatJson).concat(["errorCode", "errorMessage"]);


const values = Object.values(flatJson).concat(["yourErrorCode", "youErroeMessage"]);
return `|${headers.join("|")}|\n|${values.join("|")}|`;
}

function generateUserInputMap(payLoad) {
let code = '';
const reqBodykeys = [];

for (const key in payLoad) {
const value = payLoad[key];

if (typeof value === 'object' && value !== null && !Array.isArray(value)){
// Nested object (e.g., accountDetails)
// code += 'reqBody.put("${key}", new JSONObject());\n';
for (const nestedkey in value) {
code += `          ((JSONObject)reqBody.get('${key}")).put("${nestedkey}", payLoad.get("${key}").get("${nestedkey}"));\n`;
}
} else {
// Top-level key 
code += `reqBody.put("${key}", payLoad.get("${key}"));\n`;
}
}

return code;
}

selectedCheckBoxes =selectedDefaults;

console.log(formatJsonToTable(selectedDefaults));
console.log(formatJsonToExample(selectedDefaults));
console.log(generateUserInputMap(selectedDefaults));

if(selectedDefaults!=undefined){
templateTableString = (requestType==='GET')?'':'\n'+formatJsonToTable(selectedDefaults);
exampleTableString = (requestType==='GET')?'':'\nExamples:\n'+formatJsonToExample(selectedDefaults);
exampleErrorTablestring = (requestType==='GET')?"":'\nExamples:\n'+formatJsonToErrorExample(selectedDefaults);
console.log(exampleErrorTablestring);
userInputMap = generateUserInputMap(selectedDefaults);
}
 } catch {


Swal.fire({

icon: 'error',
title: 'Invalid JSON',
text: 'Invalid JSON in Request Body',
});

return;
}


try {
responsePojoClasses = responseBody.trim()
? generateClass("SuccessResponseData", JSON.parse(responseBody))
: '';
} catch {
Swal.fire({
icon: 'error',
title: 'Invalid JSON',
text: 'Invalid JSON in Response Body',
});
return;
}

try {
errorResponsePojoClasses = errorResponseBody.trim()
? generateClass("ErrorResponseData", JSON.parse(errorResponseBody))
: '';
} catch {
Swal.fire({
icon: 'error',
title: 'Invalid JSON',
text: 'Invalid JSON in Response Body',
});
return;
}

const requestPojo = requestPojoClasses;
const responsePojo = responsePojoClasses;
const errorResponsePojo = errorResponsePojoClasses;

const headerString = headers
.map(h => 'headers.put("'+`${h.key}","${h.value}");`)
.join('\n');

const methodLower = requestType.toLowerCase();

const postMethodCode =`
public Response ${methodLower}() throws JsonProcessingException {
RequestSpecification requestSpecification = baseRequestSpec()
.headers(setupHeaders())
.body(requestBody(), ObjectMapperType.GSON);
setResponse(${methodLower}(requestSpecification, endPointUrl));
return getResponse();
}`;

const getMethodCode = `
public Response ${methodLower}() throws JsonProcessingException {
RequestSpecification requestSpecification = baseRequestSpec()
.headers(setupHeaders());
setResponse(${methodLower}(requestSpecification, endPointUrl));
return getResponse();
)`;

let methodCode=requestType==='GET'?getMethodCode:postMethodCode;

const requestCode = `String requestBody = """\n ${requestBody} """;`;

const maincode = `
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.mapper.objectMapperType;
import com.fasterxml.jackson.databind.MapperFeature;
import lombok.SneakyThrows;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.simple.JSONObject;
import org.ocbcqa.core.base.service.BaseRestService;
import java.lang.reflect.Type;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;
import java.net.MalformedURLException;
import org.com.core.report.Logger;


public class ${capitalize(serviceName)} extends BaseRestService {
String endPointUrl = "${apiEndpoint}";
SuccessResponseData successResponseBody;
ErrorResponseData errorResponseData;
RequestBody finalRequestBody;


private HashMap<String, String> setupHeaders() {
HashMap<String, String> headers = new HashMap<>();
${headerString}
return headers;
}

@SneakyThrows
public RequestBody requestBody() throws JsonProcessingException {
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
return finalRequestBody= new ObjectMapper().readValue(requestBody, RequestBody.class);
}



@SneakyThrows
public RequestBody requestBody(Map<String, String> payLoad) throws JsonProcessingException,ParseException {
JSONObject reqBody = (JSONObject) new JSONParser().parse(requestBody);
${userInputMap}
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
return new ObjectMapper().readValue(reqBody.toString(), RequestBody.class);

}

public ${capitalize(serviceName)}() {
try {
String appUrl = appConfig.get("applicationName", "applicationKey");
hostAddress= new URL(appUrl);
} catch (MalformedURLException muException) {
throw new Runt imeException(muException.getMessage());
}
}



${methodCode}

public void serializeSuccessResponse() {
setSuccessResponseBody(response.getBody().as(SuccessResponseData.class, ObjectMapperType.GSON));
}

public void setSuccessResponseBody(SuccessResponseData successResponseBody)
this.sucessResponseBody = successResponseBody;
}

public void serializeErrorResponse() {
setErrorResponseBody(response.getBody().as(ErrorResponseData.class, objectMapperType.GSON));
}

public void setErrorResponseBody(ErrorResponseData errorResponseData) {
this.errorResponseData = errorResponseData;
}

public SuccessResponseData getSuccessResponseData(Response response) {
return response.as(SuccessResponseData.class);
}

public ErrorResponseData getErrorResponseData(Response response) {
return response.as(ErrorResponseData.class);
}

public void validateSuccessResponseSchema() {
validateAgainstSchema(SuccessResponseData.class);
}

public void validateErrorResponseSchema() {
validateAgainstSchema(ErrorResponseData.class);
}

`;
const get =`public void sendRequestToServiceEndpoint() {`;

const post =`public void sendRequestToServiceEndpoint(DataTable dt) throws JsonProcessingException, ParseException {
List<Map<String, String>> userData= dt.asMaps(String.class, String.class);
${serviceName.toLowerCase()}.requestBody(userData.get (0)); `;

const postNoselectedDefaults =`public void sendRequestToServiceEndpoint() throws JsonProcessingException, ParseException {
${serviceName.toLowerCase()}.requestBody();`;

let getOrPost =requestType==='GET'?get:post;
if(requestType==='POST')
    {
getOrPost =selectedCheckBoxes==undefined?postNoselectedDefaults:post;
}

let scenario = requestType==='GET'?'Scenario':'Scenario Outline';
if(requestType==='POST')
    {
    scenario = selectedCheckBoxes==undefined?'Scenario':scenario;
}




const stepDefCode =
`import io.cucumber.java.en.*;
import io.restassured.response.Response;
import org.testng.Assert;
import org.json.simple.parser.ParseException;
import org.ocbcqa.core.report.Logger;
import org.ocbcqa.core.base.test.BaseStep;
import org.ocbcqa.core.util.CustomSoftAssert;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.cucumber.datatable.DataTable;

public class ${capitalize(serviceName)}Steps extends BaseStep {
private ${capitalize(serviceName)} ${serviceName.toLowerCase()} = new ${capitalize(serviceName)}();
customSoftAssert customSoftAssert = new CustomSoftAssert();
private Response response;
private ${capitalize(serviceName)}.successResponseData successResponse;	
private ${capitalize(serviceName)}.ErrorResponseData errorResponse;

@Given("the user send ${requestType.toLowerCase()} request to ${serviceName} service *****************************
${getOrPost}
response = ${serviceName.toLowerCase()}.${methodLower}();
Logger.info(response.prettyPrint());
}

@Then("the user should get status code as {int}")
public void verifystatusCode(int exceptedStatusCode) {
Assert.assertEquals(expectedStatusCode,response.getStatusCode());
}

@Then("the user verify the success schema of the response returned as excepted for ${serviceName} service endpoint")
public void verifySuccessSchema() {
${serviceName.toLowerCase()}.serializeSuccessResponse();
${serviceName.toLowerCase()}.validateSuccessResponseSchema();
}


@And("the user verify the success response body should contain valid data for ${serviceName} service endpoint")
public void verifySuccessResponseBody() {
// Add specific assertions for success response fields here
// Example: customSoftAssert.assertEquals(successResponse.getFieldName());
}

@Then("the user verify the error schema of the response returned as excepted for ${serviceName} service endpoint")
public void verifyErrorSchema() {
${serviceName.toLowerCase()}.serializeErrorResponse();
${serviceName.toLowerCase()}.validateErrorResponseSchema();
}

@And("^the user verify the error response body should contain valid data for ${serviceName} service endpoint with (.+) and (.+)$")
public void verifyErrorResponseBody(String errorCode, String errorMessage) {
// Add specific assertions for error response fields here
// Example: customSoftAssert.assertEquals(errorResponse.getErrorMessage(),errorcode);
}
}`;


const featureCode = `Feature: ${capitalize(serviceName)} API Tests

${scenario}: Verify successful ${requestType} request to ${serviceName} 
Given the user send ${requestType.toLowerCase()} request to ${serviceName} service endpoint`+
templateTableString

+`
Then the user should get status code as 200
Then the user verify the success schema of the response returned as excepted for ${serviceName} service endpoint
And the user verify the success response body should contain valid data for ${serviceName} service endpoint`+

exampleTableString



+`


${scenario}: Verify error response for ${requestType} request to ${serviceName}
Given the user send ${requestType.toLowerCase()} request to ${serviceName} service endpoint`+
templateTableString
+`
Then the user should get status code as 400
Then the user verify the error schema of the response returned as excepted for ${serviceName} service endpoint
And the user verify the error response body should contain valid data for ${serviceName} service endpoint with <errorCode> and <errorMessage>` +

exampleErrorTablestring

;

setGeneratedCode(
[
maincode,
requestPojo ? requestPojo + "\n\n" : "",
responsePojo ? responsePojo + "\n\n" : "",
errorResponsePojo ? errorResponsePojo : "",
requestCode,
"\n}",
].join("")
);

setStepDefinition(stepDefCode);
setFeatureFile(featureCode);


toast.success('Code has been genterated successfully! please scroll down & look for generated code',{
position: "bottom-center",
autoClose: 3000,
hideprogressBar: false,
closeOnClick: true,
pauseOnHover: true,
draggable: true,
progress: undefined,
});
};


function formatJsonStringToHeaderText(jsonString) {
try {
const jsonObj = JSON.parse(jsonString);
return Object.entries(jsonObj)
.map(([key, value]) => `${key}:${value}`)
.join('\n');
} catch (error) {
console.error("Invalid JSON string:", error);
return "";
}
}

const handleData = (data) => {

console.log(data);

if (!data.details.summary) {
data.details.summary = "untitled";
}

let successResponses = data.details.responseSamples.success;
let errorResponses = data.details.responseSamples.failure;

let request = data.details.requestSample==null?'{}':JSON.stringify(data.details.requestSample);
let response = successResponses.length > 0 ? successResponses[0] : {};
let errorResponse = errorResponses.length > 0 ? errorResponses[0] : {};
let successResponseCode = response.statusCode;

console.log("Headers :: "+data.details);
console.log("RequestBody :: "+data.details.requestSample);
console.log("Response :: "+data.details.requestSample);

let requestBody = JSON.stringify(data.details.parameters);

setServiceName(camelCase(data.details.summary));
setApiEndpoint(data.path);
setRequestType(data.method.toUpperCase());
setHeaderKey("");
setHeaderValue("");
setHeaders([]);
setBulkHeaders(formatJsonStringToHeaderText(JSON.stringify(data.details.headervalues)));
setRequestBody(request);
setResponseBody(JSON.stringify(response));
setErrorResponseBody(JSON.stringify(errorResponse));
setResponseCode(successResponseCode);

setAccordionState   ({
requestBody: true,
successResponse: true,
errorResponse: true,
bulkHeaders: true,
});

};
const downloadCode = () => {
if (!generatedCode) {
Swal.fire({
icon: 'error',
title: 'No Code',
text: 'No code to download!',
});
return;
}
const element = document.createElement("a");
const file = new Blob([generatedCode], {type: "text/plain"});
element.href = URL.createObjectURL(file);
element.download = `${capitalize(serviceName) || "GeneratedService"}.java`;
document.body.appendChild(element);
element.click();
document.body.removeChild(element);
};

    const downloadStepDefinition = () => {
        if (!stepDefinition) {
            Swal.fire({
                icon: 'error',
                title: 'No Step Definition',
                text: 'No step definition to download!',
            });
            return;
        }
        const element = document.createElement("a");
        const file = new Blob([stepDefinition], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${capitalize(serviceName) || "Generated"}Steps.java`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadFeatureFile = () => {
        if (!featureFile) {
            Swal.fire({
                icon: 'error',
                title: 'No Feature File',
                text: 'No feature file to download!',
            });
            return;
        }
        const element = document.createElement("a");
        const file = new Blob([featureFile], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${capitalize(serviceName) || "Generated"}APITests.feature`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

const renderFieldCheckboxes = (obj, path = '') => {
return Object.entries(obj).map(([key, value]) => {
const fullpath = path ? `${path}.${key}` : key;
if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
return (
<div key={fullpath} style={{ marginLeft: path ? 20 : 0 }}>
<strong>{key}</strong>
<div>{renderFieldCheckboxes(value, fullpath)}</div>
</div>
);
}else {
return (
<lable key={fullpath} style={{ display: 'block', marginLeft: path ? 20 : 0 }}>
<input 
type="checkbox"
checked={selectedRequestFields.includes(fullpath)}
onChange={() => toggleField(fullpath)}
/> {fullpath}
</lable>
);
}
});
};



const [collapse, setCollapse] = useState ({
headers: false,
request: false,
success: false,
error: false,
});

const collapseAllSections = () =>{
setCollapse({
headers: false,
request: false,
success: false,
error: false,
});
}

const expandAllSections = () =>{
setCollapse({
headers: true,
request: true,
success: true,
error: true,
});
}


const toggleCollapse = (section) => {
setCollapse({ ...collapse, [section]: !collapse[section] });
};

const getAllFieldPaths = (obj, path = '') => {
let paths = [];
for (const [key, value] of Object.entries(obj)) {
const fullPath = path ? `${path}.${key}` : key;
if (value !== null && typeof value === 'object' && !Array.isArray(value)){
paths = paths.concat(getAllFieldPaths(value, fullPath));
} else {
paths.push(fullPath);
}
}
return paths;
};

const selectAllFields = () => setSelectedRequestFields(getAllFieldPaths(parsedRequestBody));
const deselectAllFields = () => setSelectedRequestFields([]);

const [selectedRequestFields, setSelectedRequestFields] = useState([]);
const [parsedRequestBody, setParsedRequestBody] = useState({});



function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;      
    textArea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textArea);    
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
         toast.success('Code copied to clipboard!', {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }else {
        toast.success('Failed to copy', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
    }catch (err) {
        toast.error('Failed to copy code!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
    document.body.removeChild(textArea);
}

const handleServiceCopy=() => {
    copyToClipboard(visibleGeneratedCode); 
};

const handleStepCopy=() => {
    copyToClipboard(visibleStepDefinition); 
};


const handleFeatureCopy=() => {
    copyToClipboard(visibleFeatureFile); 
};
































































return (
        <div style={{
            maxWidth: 1200,
            margin: "30px auto",
            padding: 20,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
        }}>
            {/* Toast Container for notifications */}
            <ToastContainer
                position="top-left"
                autoClose={3000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <h2>API Automation Code Generator</h2>

            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <ImportFromSwagger onReset={clearAll} onData={handleData} />
            </div>
            <div style={{ marginBottom: 15 }}>
                <label>Service Name</label>
                <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => {
                    const value =e.target.value;
                    if(!value.includes(" ")){
                        setServiceName(value);
                    }
                    }}
                    placeholder="Enter service name"
                    style={{ width: "100%", padding: 8 }}
                />
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>API Endpoint URL</label>
                <input
                    type="url"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="/objects"
                    style={{ width: "100%", padding: 8 }}
                />
            </div>

            <div style={{ marginBottom: 15 }}>
                <label>Request Type</label>
                <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                    <option>HEAD</option>
                    <option>OPTIONS</option>
                </select>
            </div>


                <CollapsibleSection
                title="Request Headers"

                isOpen={accordionState.bulkHeaders}
                onToggle={() => toggleAccordion("bulkHeaders") }
                style={{backgroundColor:"#007BFF"  }}
                >

                <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Header Key"
                        value={headerKey}
                        onChange={(e) => setHeaderKey(e.target.value)}
                        style={{ flex: 1, padding: 8 }}
                    />
                    <input
                        type="text"
                        placeholder="Header Value"
                        value={headerValue}
                        onChange={(e) => setHeaderValue(e.target.value)}
                        style={{ flex: 1, padding: 8 }}
                    />
                    <button
                        type="button"
                        onClick={addHeader}
                        style={{
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                        title="Add Header"
                    >
                        <FaPlus />
                    </button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <textarea
                        rows={3}
                        placeholder="Bulk add headers (key:value per line)"
                        value={bulkHeaders}
                        onChange={(e) => setBulkHeaders(e.target.value)}
                        style={{
                            width: "100%",
                            fontFamily: "monospace",
                            padding: 8
                        }}
                    />
                    <button
                        type="button"
                        onClick={bulkAddHeaders}
                        style={{
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: '#ff4444',
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            alignSelf: "flex-start"
                        }}
                        title="Bulk Import Headers"
                    >
                        <BiSelectMultiple size={16} />
                    </button>
                </div>

                {headers.length > 0 && (
                    <ul style={{ marginTop: 10 }}>
                        {headers.map((h, i) => (
                            <li key={i}><b>{h.key}</b>: {h.value}</li>
                        ))}
                    </ul>
                )}

            </CollapsibleSection>


            <CollapsibleSection
                title="Request Body"
                isOpen={accordionState.requestBody}
                onToggle={() => toggleAccordion("requestBody")}
            >

                {viewMode.request === 'view' ? (
                    <div style={{ position: 'relative' }}>
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                                fontSize: '14px',
                                borderRadius: '4px',
                                padding: '16px',
                                overflowX: 'auto',
                                backgroundColor: '#1e1e1e'
                            }}
                        >
                            {requestBody}
                        </SyntaxHighlighter>
                        <button
                            onClick={() => toggleEditMode('request')}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '6px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Edit"
                        >
                            <FaEdit size={14} />
                        </button>
                    </div>
                ) : (
                    <textarea
                        rows={10}
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder="Enter JSON request body here"
                        style={{
                            width: "100%",
                            fontFamily: "monospace",
                            padding: 8
                        }}
                    />
                )}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {viewMode.request === 'edit' && (
                        <button
                            type="button"
                            onClick={() => formatJson(requestBody, setRequestBody, 'request')}
                            style={{ padding: "8px 16px" }}
                        >
                            Format JSON
                        </button>
                    )}
                </div>
                    {viewMode.request === 'view' && Object.keys(parsedRequestBody).length > 0 && ( 
                        <div style={{marginTop: 10 }}>
                        <strong>Select Fields:</strong>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                            <button onClick={selectAllFields}>select All </button>
                            <button onClick={deselectAllFields}>select None</button>
                        </div>
                        <div style={{
                        maxHeight: '250px',
                        overflowY: 'auto',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9'
            }}>
                          {renderFieldCheckboxes(parsedRequestBody)}
                          </div>
                            </div>
             
                   ) }                                              
            </CollapsibleSection>






            <CollapsibleSection
                title="Success Response Body"
                isOpen={accordionState.successResponse}
                onToggle={() => toggleAccordion("successResponse")}
            >
                {viewMode.response === 'view' ? (
                    <div style={{ position: 'relative' }}>
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                                fontSize: '14px',
                                borderRadius: '4px',
                                padding: '16px',
                                overflowX: 'auto',
                                backgroundColor: '#1e1e1e'
                            }}
                        >
                            {responseBody}
                        </SyntaxHighlighter>
                        <button
                            onClick={() => toggleEditMode('response')}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '6px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Edit"
                        >
                            <FaEdit size={14} />
                        </button>
                    </div>
                ) : (
                    <textarea
                        rows={10}
                        value={responseBody}
                        onChange={(e) => setResponseBody(e.target.value)}
                        placeholder="Enter JSON success response body here"
                        style={{
                            width: "100%",
                            fontFamily: "monospace",
                            padding: 8
                        }}
                    />
                )}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {viewMode.response === 'edit' && (
                        <button
                            type="button"
                            onClick={() => formatJson(responseBody, setResponseBody, 'response')}
                            style={{ padding: "8px 16px" }}
                        >
                            Format JSON
                        </button>
                    )}
                </div>
            </CollapsibleSection>


            <CollapsibleSection
                title="Error Response Body"
                isOpen={accordionState.errorResponse}
                onToggle={() => toggleAccordion("errorResponse")}
            >

                {viewMode.error === 'view' ? (
                    <div style={{ position: 'relative' }}>


                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                                fontSize: '14px',
                                borderRadius: '4px',
                                padding: '16px',
                                overflowX: 'auto',
                                backgroundColor: '#1e1e1e'


                            }}
                        >
                            {errorResponseBody}
                        </SyntaxHighlighter>
                        <button
                            onClick={() => toggleEditMode('error')}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '6px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Edit"
                        >
                            <FaEdit size={14} />
                        </button>
                    </div>
                ) : (
                    <textarea
                        rows={10}
                        value={errorResponseBody}
                        onChange={(e) => setErrorResponseBody(e.target.value)}
                        placeholder="Enter JSON error response body here"
                        style={{
                            width: "100%",
                            fontFamily: "monospace",
                            padding: 8
                        }}
                    />
                )}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {viewMode.error === 'edit' && (
                        <button
                            type="button"
                            onClick={() => formatJson(errorResponseBody, setErrorResponseBody, 'error')}
                            style={{ padding: "8px 16px" }}
                        >
                            Format JSON
                        </button>
                    )}
                </div>
            </CollapsibleSection>

            <div style={{ marginBottom: 15 }}>
                <label>Response Code</label>
                <select
                    value={responseCode}
                    onChange={(e) => setResponseCode(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                >
                    {[100, 101, 102, 200, 201, 202, 204, 400, 401, 403, 404, 500, 502, 503].map((code) => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
                <button
                    type="button"
                    onClick={generateCode}
                    style={{
                        padding: "10px 16px",
                        background: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaCode /> Generate Code
                </button>
                <button
                    type="button"
                    onClick={clearAll}
                    style={{
                        padding: "10px 16px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaTrash /> Clear All
                </button>
            </div>

            {generatedCode && (
                <fieldset style={{ marginBottom: 20, padding: 15 }}>
                    <legend>Generated Java Service Code</legend>
                    <SyntaxHighlighter
                        language="java"
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        customStyle={{
                            fontSize: '14px',
                            borderRadius: '4px',
                            padding: '16px',
                            overflowX: 'auto',
                            backgroundColor: '#1e1e1e'
                        }
                    }
                    >
                        {/* {generatedCode} */}
                        {visibleGeneratedCode}
                    </SyntaxHighlighter>

                    <div style={{display:"inline-flex", gap: '10px', marginTop: 10}}>
                    <button
                        type="button"
                        onClick={downloadCode}
                        style={{
                            padding: "8px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <FaDownload /> Download Service Code
                    </button>
                    <button
                        onClick={handleServiceCopy}
                        style={{
                            padding: "8px 2px",
                            color:"white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                        }}
                    >
                        <FaCopy /> Copy Code
                    </button>
                    </div>
                </fieldset>
            )}

            {stepDefinition && (
                <fieldset style={{ marginBottom: 20, padding: 15 }}>
                    <legend>Step Definition File</legend>
                    <SyntaxHighlighter
                        language="java"
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        customStyle={{
                            fontSize: '14px',
                            borderRadius: '4px',
                            padding: '16px',
                            overflowX: 'auto',
                            backgroundColor: '#1e1e1e'
                        }}
                    >
                        {/* {stepDefinition} */}
                        {visibleStepDefinition}
                    </SyntaxHighlighter>

                    <div style={{display:"inline-flex", gap: '10px', marginTop: 10}}>

                    <button
                        type="button"
                        onClick={downloadStepDefinition}
                        style={{

                            padding: "8px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <FaDownload /> Download Step Definition
                    </button>
                    <button
                        onClick={handleStepCopy}
                        style={{
                            padding: "8px 2px",
                            color:"white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",

                        }}
                    >
                        <FaCopy /> Copy Code
                    </button>
                    </div>
                </fieldset>
            )}

            <div style={{ overflow:'auto',maxWidth:'100%' }}>
            {featureFile && (
                <fieldset style={{ marginBottom: 20, padding: 15 }}>
                    <legend>Feature File</legend>
                    <SyntaxHighlighter
                        language="gherkin"
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        customStyle={{
                            fontSize: '14px',
                            borderRadius: '4px',
                            padding: '16px',
                            overflowX: 'auto',
                            backgroundColor: '#1e1e1e'
                        }}
                    >
                        {/* {featureFile} */}
                        {visibleFeatureFile}
                    </SyntaxHighlighter>
                     <div style={{display:"inline-flex", gap: '10px', marginTop: 10}}>

                    <button
                        type="button"
                        onClick={downloadFeatureFile}
                        style={{
                            padding: "8px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <FaDownload /> Download Feature File
                    </button>
                    <button
                        onClick={handleFeatureCopy}
                        style={{
                            padding: "8px 2px",
                            color:"white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",

                        }}
                    >
                        <FaCopy /> Copy Code
                    </button>
                    </div>

                </fieldset>
            )}
        </div>

</div>
    );
}


export default App;
	
	
	









































