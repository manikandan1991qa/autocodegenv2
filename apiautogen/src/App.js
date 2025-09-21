import React, { useEffect, useState, useRef, useCallback } from "react";


import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  FaEdit,
  FaPlus,
  FaCode,
  FaTrash,
  FaDownload,
  FaCopy,
  FaArrowRight,
  FaArrowLeft
} from "react-icons/fa";
import { BiSelectMultiple } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import ImportFromSwagger from "./ImportFromSwagger";
import { camelCase } from "change-case";
import "./App.css"; // Import the CSS file
import { xcode } from "react-syntax-highlighter/dist/esm/styles/hljs";



// --- Constants ---
const JSON_PARSE_ERROR_TITLE = "Invalid JSON";
const JSON_PARSE_ERROR_TEXT = "Please check your input. Error: ";
const MISSING_INFO_TITLE = "Missing Information";
const FORMATTING_ERROR_TITLE = "Formatting Error";
const NO_CODE_TITLE = "No Code";
const TOAST_POSITION = "bottom-center";
const TOAST_AUTO_CLOSE = 3000;

// --- CollapsibleSection Component ---
const CollapsibleSection = React.memo(
  ({ title, isOpen, onToggle, children }) => (
    <div className="collapsible-section-container">
      <div
        onClick={onToggle}
        className={`collapsible-section-header ${isOpen ? "open" : ""}`}
      >
        {title}
        <span className="collapsible-section-icon">{isOpen ? "▴" : "▾"}</span>
      </div>
      {isOpen && <div className="collapsible-section-content">{children}</div>}
    </div>
  )
);

// --- Custom Hook for Line-by-Line Code Display ---
// const useLineByLineCode = (fullCode, delay = 120) => {
//   const [visibleCode, setVisibleCode] = useState("");
//   const intervalRef = useRef(null);

//   useEffect(() => {
//     if (typeof fullCode !== "string" || !fullCode.trim()) {
//       setVisibleCode("");
//       return;
//     }

//     const lines = fullCode.split("\n");
//     let currentLine = 0;
//     let accumulatedCode = "";

//     intervalRef.current = setInterval(() => {
//       if (currentLine < lines.length) {
//         accumulatedCode += lines[currentLine] + "\n";
//         setVisibleCode(accumulatedCode);
//         currentLine++;
//       } else {
//         clearInterval(intervalRef.current);
//       }
//     }, delay);

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [fullCode, delay]);

//   return visibleCode;
//};


const useLineByLineCode = (fullCode, delay = 50) => {

  const [visibleCode, setVisibleCode] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof fullCode !== "string" || !fullCode.trim()) {
      setVisibleCode("");
      return;
    }

    const lines = fullCode.split("\n");
    const maxAnimatedLines = 50;
      let currentLine = 0;
    let accumulatedCode = "";

    intervalRef.current = setInterval(() => {
      if (currentLine < lines.length) {
        if (currentLine < maxAnimatedLines) {
                  accumulatedCode += lines[currentLine] + "\n";
        setVisibleCode(accumulatedCode);
            } else {

              const remainingLines = lines.slice(currentLine).join("\n");
              accumulatedCode += remainingLines;
              setVisibleCode(accumulatedCode);
              clearInterval(intervalRef.current);
            }
        currentLine++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fullCode, delay]);

  return visibleCode;
};




// --- New TitleBar Component ---
// const TitleBar = ({ title }) => (
//   <div className="title-bar">
//     <h1>{title}</h1>
//   </div>
// );


//Footer component
const Footer = ({ footerText }) => (
  <div className="footer">
    <p>{footerText}</p> 
  </div>  
);

// --- Main App Component ---
function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceName, setServiceName] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [requestType, setRequestType] = useState("GET");
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [headers, setHeaders] = useState([]);
  const [bulkHeaders, setBulkHeaders] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [responseBody, setResponseBody] = useState("");
  const [errorResponseBody, setErrorResponseBody] = useState("");
  const [responseCode, setResponseCode] = useState("200");
  const [generatedCode, setGeneratedCode] = useState("");
  const [stepDefinition, setStepDefinition] = useState("");
  const [featureFile, setFeatureFile] = useState("");
  const [isRequestBodyFormatted, setIsRequestBodyFormatted] = useState(false);
  const [parsedRequestBody, setParsedRequestBody] = useState({});
  const [selectedRequestFields, setSelectedRequestFields] = useState([]);

  const visibleGeneratedCode = useLineByLineCode(generatedCode);
  const visibleStepDefinition = useLineByLineCode(stepDefinition);
  const visibleFeatureFile = useLineByLineCode(featureFile);

  const [viewMode, setViewMode] = useState({
    request: "edit",
    response: "edit",
    error: "edit",
  });



































































  const TitleBar = ({ title, subtitle, onClick, logoSrc }) => {
    const renderColoredTitle = (text) => 
      text.split('').map((char, index) => (
        <span 
          key={index} 
          style={{ color: index % 2 === 0 ? '#1B4158' : '#3AA4D8' }}
        >
          {char}  
        </span>
      ));

      return (
        <div
          className="title-bar"
          style={{
            position: 'relative',
            height: '80px',
            display: 'flex',
            alignItems: 'center', 
            justifyContent: 'center',
          }}
          >
            {/* Clickable logo - left aligned and fills the height */}
            <div
              onClick={onClick}
              style={{
                position: 'absolute',
                left: '10px',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              <img
                src={logoSrc}
                alt="Logo"
                style={{
                  height: '80%',
                  objectFit: 'contain',
                }}
              />
          </div>

{/* Centered title and subtitle */}
          <div style={{ textAlign: 'center' }}>
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
            <h1 className="clickable-title" onClick={onClick}>
              {renderColoredTitle(title)}
              </h1>
              {/* </div> */}
              {subtitle && <p className="subtitle">{subtitle}</p>}
              </div>
        </div>
      );
    };

  const [accordionState, setAccordionState] = useState({
    requestBody: false,
    successResponse: false,
    errorResponse: false,
    bulkHeaders: false,
  });

  const toggleAccordion = useCallback((section) => {
    setAccordionState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const addHeader = useCallback(() => {
    if (headerKey.trim() && headerValue.trim()) {
      setHeaders((prev) => [
        ...prev,
        { key: headerKey.trim(), value: headerValue.trim() },
      ]);
      setHeaderKey("");
      setHeaderValue("");
    }
  }, [headerKey, headerValue]);

  const bulkAddHeaders = useCallback(() => {
    if (bulkHeaders.trim()) {
      const newHeaders = bulkHeaders
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.includes(":"))
        .map((line) => {
          const idx = line.indexOf(":");
          return {
            key: line.slice(0, idx).trim(),
            value: line.slice(idx + 1).trim(),
          };
        });
      setHeaders((prev) => [...prev, ...newHeaders]);
      setBulkHeaders("");
    }
  }, [bulkHeaders]);

  const clearAll = useCallback(() => {
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
      request: "edit",
      response: "edit",
      error: "edit",
    });
    setParsedRequestBody({});
    setSelectedRequestFields([]);
    setAccordionState({
      requestBody: false,
      successResponse: false,
      errorResponse: false,
      bulkHeaders: false,
    });
    setCurrentStep(1); // Reset to first step on clear
  }, []);

  const buildTree = useCallback((obj) => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return true; // Leaf node or array
    const tree = {};
    for (const key in obj) {
      tree[key] = buildTree(obj[key]);
    }
    return tree;
  }, []);

  const getAllFieldPaths = useCallback((obj, path = "") => {
    let paths = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        paths = paths.concat(getAllFieldPaths(value, fullPath));
      } else {
        paths.push(fullPath);
      }
    }
    return paths;
  }, []);

  const formatJson = useCallback(
    (jsonStr, setter, field) => {
      try {
        if (!jsonStr.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Please enter JSON to format",
          });
          return;
        }

        const parsed = JSON.parse(jsonStr);
        const pretty = JSON.stringify(parsed, null, 2);
        setter(pretty);

        if (field === "request") {
          setParsedRequestBody(parsed);
          const allPaths = getAllFieldPaths(parsed);
          setSelectedRequestFields(allPaths); // all checked initially
          setIsRequestBodyFormatted(true);
        }

        setViewMode((prev) => ({ ...prev, [field]: "view" }));
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: JSON_PARSE_ERROR_TITLE,
          text: `${JSON_PARSE_ERROR_TEXT} ${e.message}`,
        });
      }
    },
    [getAllFieldPaths]
  );

  const toggleField = useCallback((key) => {
    setSelectedRequestFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const toggleEditMode = useCallback((field) => {
    setViewMode((prev) => ({ ...prev, [field]: "edit" }));
  }, []);

  const capitalize = useCallback(
    (str) => str.charAt(0).toUpperCase() + str.slice(1),
    []
  );

  const detectType = useCallback((value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return "List<Object>";
      const itemType = detectType(value[0]);
      return itemType ? `List<${itemType}>` : "List<Object>"; // Handle nested objects in lists
    }
    if (value === null) return "Object";
    switch (typeof value) {
      case "number":
        return Number.isInteger(value) ? "int" : "double";
      case "boolean":
        return "boolean";
      case "object":
        return null; // Indicates a nested object
      default:
        return "String";
    }
  }, []);

  const usedClassNames = new Set();
  const classNameMap = new Map();

const generateClass = useCallback(
    (name, jsonObj, indent = "    ",rootName = null, parentpath = '') => {
      if (!rootName) rootName = name;

      //Generate a unique and readable class name
      let baseClassName = name;
      let fullPathName = parentpath ? `${parentpath}.${capitalize(name)}` : name;
  
        let className = usedClassNames.has(baseClassName) ? fullPathName : baseClassName;
        usedClassNames.add(className);
        classNameMap.set(`${parentpath}_${name}`, className); //map for reference

      let classCode = `\n${indent}@Data\n${indent}public static class ${className} {\n`;
      let nestedClasses = '';

      for (const [key, value] of Object.entries(jsonObj)) {
        let type = detectType(value);
        let actualType = type;

        if (type === null) {
        const nestedClassName = capitalize(key);
        const nestedPathKey = `${fullPathName}_${nestedClassName}`;
        const nestedCode = generateClass(nestedClassName, value, indent + '    ', rootName, fullPathName);
        actualType = classNameMap.get(nestedPathKey);
        nestedClasses += '\n' + nestedCode.split('\n').map(line => indent + line).join('\n') + '\n';
        } else if (type.startsWith("List<") && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {  
          const nestedClassName = capitalize(key);
          const nestedPathKey = `${fullPathName}_${nestedClassName}`;
          const nestedCode = generateClass(nestedClassName, value[0], indent + "    ", rootName, fullPathName);
          actualType = `List<${classNameMap.get(nestedPathKey)}>`;
          nestedClasses += '\n' + nestedCode.split("\n").map(line => indent + line).join('\n') + '\n';
        }

        if (rootName === "ErrorResponseData" || rootName === "SuccessResponseData") {
        classCode += `
        @JsonProperty(value="${key}")
        private ${actualType} ${camelCase(key)};\n`;
      } else {
        classCode += `${indent}private ${actualType} ${key};\n`;

      }
      }

      classCode += nestedClasses + `${indent}}\n`;
return classCode;
    },
    [capitalize, detectType]
  );

  const filterJsonBySelection = useCallback((obj, selectedPaths) => {
    const result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const fullPath = selectedPaths.find(
        (path) => path === key || path.startsWith(`${key}.`)
      );
      if (fullPath) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          // Recursively filter if it's an object or array
          result[key] = filterJsonBySelection(
            obj[key],
            selectedPaths
              .map((path) => path.replace(`${key}.`, ""))
              .filter(Boolean)
          );
        } else {
          // It's a primitive, just include it
          result[key] = obj[key];
        }
      }
    }
    return result;
  }, []);

  const flattenJson = useCallback((obj, prefix = "") => {
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(result, flattenJson(value, newKey));
      } else {
        result[newKey] = value === "" ? `<Add ${newKey} here>` : value;
      }
    }
    return result;
  }, []);

  const formatJsonToTable = useCallback(
    (inputJson) => {
      const flatJson = flattenJson(inputJson);
      const headers = Object.keys(flatJson);
      const placeholders = headers.map((key) => `<${key}>`);
      return `|${headers.join("|")}|\n|${placeholders.join("|")}|`;
    },
    [flattenJson]
  );

  const formatErrorJsonToTable = useCallback(
    (inputJson) => {
      const flatJson = flattenJson(inputJson);
      const headers = ["action","fieldName"].concat(Object.keys(flatJson));
      const placeholders = headers.map((key) => `<${key}>`);
      return `|${headers.join("|")}|\n|${placeholders.join("|")}|`;
    },
    [flattenJson]
  );

  const formatJsonToExample = useCallback(
    (inputJson) => {
      const flatJson = flattenJson(inputJson);
      const headers = Object.keys(flatJson);
      const values = Object.values(flatJson);
      return `|${headers.join("|")}|\n|${values.join("|")}|`;
    },
    [flattenJson]
  );

  const formatJsonToErrorExample = useCallback(
    (inputJson) => {
      const flatJson = flattenJson(inputJson);
      const headers = ["action","fieldName"].concat(Object.keys(flatJson)).concat(["errorCode", "errorMessage"]);
      const values = ["remove or null or invalid","field to be modified"].concat(Object.values(flatJson)).concat(["yourErrorCode", "yourErrorMessage"]);
      return `|${headers.join("|")}|\n|${values.join("|")}|`;
    },
    [flattenJson]
  );

  const generateUserInputMap = useCallback((payLoad) => {
    let code = "";
    for (const key in payLoad) {
      const value = payLoad[key];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        for (const nestedKey in value) {
          code += `          ((JSONObject)reqBody.get("${key}")).put("${nestedKey}", payLoad.get("${key}").get("${nestedKey}"));\n`;
        }
      } else {
        code += `        reqBody.put("${key}", payLoad.get("${key}"));\n`;
      }
    }
    return code;
  }, []);

  const generateCode = useCallback(() => {
    if (!serviceName.trim()) {
      Swal.fire({
        icon: "error",
        title: MISSING_INFO_TITLE,
        text: "Please enter Service Name.",
      });
      return;
    }
    if (!apiEndpoint.trim()) {
      Swal.fire({
        icon: "error",
        title: MISSING_INFO_TITLE,
        text: "Please enter API Endpoint URL.",
      });
      return;
    }
    if (!requestBody.trim()) {
      // Only require formatting if a body exists
      Swal.fire({
        icon: "error",
        title: FORMATTING_ERROR_TITLE,
        text: "Please Enter the Request Body.",
      });
      return;
    }
    if (!isRequestBodyFormatted && requestBody.trim()) {
      // Only require formatting if a body exists
      Swal.fire({
        icon: "error",
        title: FORMATTING_ERROR_TITLE,
        text: "Please format the Request Body.",
      });
      return;
    }

    let requestPojoClasses = "";
    let responsePojoClasses = "";
    let errorResponsePojoClasses = "";
    let templateTableString = "";
    let errorTemplateTableString = "";
    let exampleTableString = "";
    let exampleErrorTablestring = "";
    let userInputMap = "";
    let selectedDefaults = undefined;

    try {
      setCurrentStep(3); // Move to the Final Step

      if (requestBody.trim()) {
        const rawRequestObj = JSON.parse(requestBody);
        // Filter the raw request object based on selected fields
        const filteredRequestObj = filterJsonBySelection(
          rawRequestObj,
          selectedRequestFields
        );
        requestPojoClasses = generateClass("RequestBody", rawRequestObj); // Generate POJO for full request body
        selectedDefaults = filteredRequestObj; // Use filtered object for tables/maps

        if (Object.keys(selectedDefaults).length > 0) {
          templateTableString =
            requestType === "GET"
              ? ""
              : "\n" + formatJsonToTable(selectedDefaults);

          errorTemplateTableString =
            requestType === "GET"
              ? ""
              : "\n" + formatErrorJsonToTable(selectedDefaults);

          
        exampleTableString =
            requestType === "GET"
              ? ""
              : "\nExamples:\n" + formatJsonToExample(selectedDefaults);
          exampleErrorTablestring =
            requestType === "GET"
              ? ""
              : "\nExamples:\n" + formatJsonToErrorExample(selectedDefaults);
          userInputMap = generateUserInputMap(selectedDefaults);
        }
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: JSON_PARSE_ERROR_TITLE,
        text: `${JSON_PARSE_ERROR_TEXT} ${e.message}`,
      });
      return;
    }

    try {
      responsePojoClasses = responseBody.trim()
        ? generateClass("SuccessResponseData", JSON.parse(responseBody))
        : "";
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: JSON_PARSE_ERROR_TITLE,
        text: `${JSON_PARSE_ERROR_TEXT} in Response Body: ${e.message}`,
      });
      return;
    }

    try {
      errorResponsePojoClasses = errorResponseBody.trim()
        ? generateClass("ErrorResponseData", JSON.parse(errorResponseBody))
        : "";
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: JSON_PARSE_ERROR_TITLE,
        text: `${JSON_PARSE_ERROR_TEXT} in Error Response Body: ${e.message}`,
      });
      return;
    }

    const headerString = headers
      .map((h) => `headers.put("${h.key}", "${h.value}");`)
      .join("\n");
    const methodLower = requestType.toLowerCase();

    const postMethodCode = `
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
}`;

    let methodCode = requestType === "GET" ? getMethodCode : postMethodCode;

    const mainCode = `
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.mapper.ObjectMapperType;
import com.fasterxml.jackson.databind.MapperFeature;
import lombok.SneakyThrows;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.ocbcqa.core.base.service.BaseRestService;
import java.lang.reflect.Type;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;
import java.net.MalformedURLException;
import org.ocbcqa.core.report.Logger;


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
        return finalRequestBody = objectMapper.readValue(requestBody, RequestBody.class);
    }

    @SneakyThrows
    public RequestBody requestBody(Map<String, String> payLoad) throws JsonProcessingException, ParseException {
        JSONObject reqBody = (JSONObject) new JSONParser().parse(requestBody);
${userInputMap}
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
        return objectMapper.readValue(reqBody.toString(), RequestBody.class);
    }

    public ${capitalize(serviceName)}() {
        try {
            String appUrl = "";            //TODO: please fill in your host url here
            hostAddress = new URL(appUrl);
        } catch (MalformedURLException muException) {
            throw new RuntimeException(muException.getMessage());
        }
    }

    ${methodCode}

    public void serializeSuccessResponse() {
        setSuccessResponseBody(response.getBody().as(SuccessResponseData.class, ObjectMapperType.GSON));
    }

    public void setSuccessResponseBody(SuccessResponseData successResponseBody) {
        this.successResponseBody = successResponseBody;
    }

    public void serializeErrorResponse() {
        setErrorResponseBody(response.getBody().as(ErrorResponseData.class, ObjectMapperType.GSON));
    }

    public void setErrorResponseBody(ErrorResponseData errorResponseData) {
        this.errorResponseData = errorResponseData;
    }

    public SuccessResponseData getSuccessResponseData() {
        return response.as(SuccessResponseData.class);
    }

    public ErrorResponseData getErrorResponseData() {
        return response.as(ErrorResponseData.class);
    }

    public void validateSuccessResponseSchema() {
        validateAgainstSchema(SuccessResponseData.class);
    }

    public void validateErrorResponseSchema() {
        validateAgainstSchema(ErrorResponseData.class);
    }

public JSONObject updateRequestBodyAsPerDataInput(JSONObject reqBody, String fieldName, String action) {
String[] actionField = fieldName.split("\\\\.");
String key = actionField[0];
String subKey = actionField.length > 1 ? actionField[1] : null;

switch (action.toLowerCase()) {
    case "remove":
      if (subKey != null && reqBody.get(key) instanceof JSONObject) {
        ((JSONObject) reqBody.get(key)).remove(subKey);
      } else {
        reqBody.remove(key);
      }
      break;

    case "null":
      if (subKey != null && reqBody.get(key) instanceof JSONObject) {
        ((JSONObject) reqBody.get(key)).put(subKey, "");
      } else {
        reqBody.put(key, "");
      }
      break;

      default:
        // Optionally handle unknown actions
        throw new IllegalArgumentException("Unsupported action: " + action);
}

return reqBody;
}

public void buildRequestBodywithUserData(Map<String, String> payLoad) throws JsonProcessingException {
ObjectMapper mapper = new ObjectMapper();
Map<String, Object> map = mapper.convertValue(finalRequestBody, Map.class);
mapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
finalRequestBody = mapper.readValue(updateRequestBodyAsPerDataInput(new JSONobject(map),payLoad.get("fieldName"),payLoad.get("action")).toString(), RequestBody.class);
}
`;

let getOrPostStep = `public void sendRequestToServiceEndpoint() throws JsonProcessingException, ParseException {`;
    let scenarioType = "Scenario";

    if (
      requestType === "POST" ||
      requestType === "PUT" ||
      requestType === "PATCH"
    ) {
      if (selectedDefaults && Object.keys(selectedDefaults).length > 0) {
        getOrPostStep = `public void sendRequestToServiceEndpoint(DataTable dt) throws JsonProcessingException, ParseException {
    List<Map<String, String>> userData= dt.asMaps(String.class, String.class);
    ${camelCase(serviceName)}.requestBody(userData.get(0));
    Optional.ofNullable(userData.get(0).get("action"))
    .filter(action -> action.equalsIgnoreCase("remove") || action.equalsIgnoreCase("null"))
    .ifPresent(action -> {
        try {
            ${camelCase(serviceName)}.buildRequestBodywithUSerData(userData.get(0));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    });`;
        scenarioType = "Scenario Outline";
      } else {
        getOrPostStep = `public void sendRequestToServiceEndpoint() throws JsonProcessingException, ParseException {
    ${camelCase(serviceName)}.requestBody();`;
      }
    }

    const stepDefCode = `import io.cucumber.java.en.*;
import io.restassured.response.Response;
import org.testng.Assert;
import org.json.simple.parser.ParseException;
import org.ocbcqa.core.report.Logger;
import org.ocbcqa.core.base.test.BaseStep;
import org.ocbcqa.core.util.CustomSoftAssert;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.cucumber.datatable.DataTable;

public class ${capitalize(serviceName)}Steps extends BaseStep {
    private ${capitalize(serviceName)} ${camelCase(
      serviceName
    )} = new ${capitalize(serviceName)}();
    CustomSoftAssert customSoftAssert = new CustomSoftAssert();
    private Response response;
    private ${capitalize(serviceName)}.SuccessResponseData successResponse; 
    private ${capitalize(serviceName)}.ErrorResponseData errorResponse;

    @Given("the user send ${requestType.toLowerCase()} request to ${serviceName} service endpoint")
    ${getOrPostStep}
        response = ${camelCase(serviceName)}.${methodLower}();
        Logger.info(response.prettyPrint());
    }

    @Then("the user should get status code for ${serviceName} endpoint as {int}")
    public void verifystatusCode(int expectedStatusCode) {
        Assert.assertEquals(response.getStatusCode(),expectedStatusCode);
    }

    @Then("the user verify the success schema of the response returned as expected for ${serviceName} service endpoint")
    public void verifySuccessSchema() {
        ${camelCase(serviceName)}.serializeSuccessResponse();
        ${camelCase(serviceName)}.validateSuccessResponseSchema();
    }

    @And("the user verify the success response body should contain valid data for ${serviceName} service endpoint")
    public void verifySuccessResponseBody() {
        // Add specific assertions for success response fields here
        // Example: customSoftAssert.assertEquals(successResponse.getFieldName());
    }

    @Then("the user verify the error schema of the response returned as expected for ${serviceName} service endpoint")
    public void verifyErrorSchema() {
        ${camelCase(serviceName)}.serializeErrorResponse();
        ${camelCase(serviceName)}.validateErrorResponseSchema();
    }

    @And("^the user verify the error response body should contain valid data for ${serviceName} service endpoint with (.+) and (.+)$")
    public void verifyErrorResponseBody(String errorCode, String errorMessage) {
        // Add specific assertions for error response fields here
        // Example: customSoftAssert.assertEquals(errorResponse.getErrorMessage(), errorCode);
    }
}`;

    const featureCode = `Feature: ${capitalize(serviceName)} API Tests

${scenarioType}: Verify successful ${requestType} request to ${serviceName} 
    Given the user send ${requestType.toLowerCase()} request to ${serviceName} service endpoint${templateTableString}
    Then the user should get status code for ${serviceName} endpoint as 200
    And the user verify the success schema of the response returned as expected for ${serviceName} service endpoint
    And the user verify the success response body should contain valid data for ${serviceName} service endpoint${exampleTableString}

${scenarioType}: Verify error response for ${requestType} request to ${serviceName}
    Given the user send ${requestType.toLowerCase()} request to ${serviceName} service endpoint${errorTemplateTableString}
   Then the user should get status code for ${serviceName} endpoint as 200
    And the user verify the error schema of the response returned as expected for ${serviceName} service endpoint
    And the user verify the error response body should contain valid data for ${serviceName} service endpoint with <errorCode> and <errorMessage>${exampleErrorTablestring}
`;

    setGeneratedCode(
      [
        mainCode,
        requestPojoClasses ? requestPojoClasses + "\n" : "",
        responsePojoClasses ? responsePojoClasses + "\n" : "",
        errorResponsePojoClasses ? errorResponsePojoClasses : "",
        `String requestBody = """\n${requestBody}\n""";`,
        "\n}",
      ].join("")
    );

    setStepDefinition(stepDefCode);
    setFeatureFile(featureCode);

    toast.success(
      "Code has been generated successfully! Please scroll down & look for generated code.",
      {
        position: TOAST_POSITION,
        autoClose: TOAST_AUTO_CLOSE,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  }, [
    serviceName,
    apiEndpoint,
    requestType,
    isRequestBodyFormatted,
    requestBody,
    responseBody,
    errorResponseBody,
    headers,
    generateClass,
    capitalize,
    filterJsonBySelection,
    formatJsonToTable,
    formatJsonToExample,
    formatJsonToErrorExample,
    generateUserInputMap,
    selectedRequestFields,
  ]);

  const formatJsonStringToHeaderText = useCallback((jsonString) => {
    try {
      const jsonObj = JSON.parse(jsonString);
      return Object.entries(jsonObj)
        .map(([key, value]) => `${key}:${value}`)
        .join("\n");
    } catch (error) {
      console.error("Invalid JSON string:", error);
      return "";
    }
  }, []);

  const handleData = useCallback(
    (data) => {
      if (!data.details.summary) {
        data.details.summary = "untitled";
      }

      const successResponses = data.details.responseSamples.success;
      const errorResponses = data.details.responseSamples.failure;

      const request =
        data.details.requestSample === null
          ? "{}"
          : JSON.stringify(data.details.requestSample);
      const response = successResponses.length > 0 ? successResponses[0] : {};
      const errorResponse = errorResponses.length > 0 ? errorResponses[0] : {};
      const successResponseCode = response.statusCode;

      setServiceName(camelCase(data.details.summary));
      setApiEndpoint(data.path);
      setRequestType(data.method.toUpperCase());
      setHeaders([]); // Clear previous headers
      setBulkHeaders(
        formatJsonStringToHeaderText(JSON.stringify(data.details.headervalues))
      );
      setRequestBody(request);
      setResponseBody(JSON.stringify(response));
      setErrorResponseBody(JSON.stringify(errorResponse));
      setResponseCode(successResponseCode);
      setIsRequestBodyFormatted(false); // Reset formatting status for new input
      setParsedRequestBody({}); // Clear parsed body
      setSelectedRequestFields([]); // Clear selected fields

      setAccordionState({
        requestBody: true,
        successResponse: true,
        errorResponse: true,
        bulkHeaders: true,
      });
      setViewMode({
        request: "edit",
        response: "edit",
        error: "edit",
      });

      //   setCurrentStep(2); // Move to the next step after importing
    },
    [formatJsonStringToHeaderText]
  );

  const downloadFile = useCallback((content, filename, type) => {
    if (!content) {
      Swal.fire({
        icon: "error",
        title: NO_CODE_TITLE,
        text: `No ${type} to download!`,
      });
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, []);

  const downloadCode = useCallback(() => {
    downloadFile(
      generatedCode,
      `${capitalize(serviceName) || "GeneratedService"}.java`,
      "code"
    );
  }, [generatedCode, serviceName, capitalize, downloadFile]);

  const downloadStepDefinition = useCallback(() => {
    downloadFile(
      stepDefinition,
      `${capitalize(serviceName) || "Generated"}Steps.java`,
      "step definition"
    );
  }, [stepDefinition, serviceName, capitalize, downloadFile]);

  const downloadFeatureFile = useCallback(() => {
    downloadFile(
      featureFile,
      `${capitalize(serviceName) || "Generated"}APITests.feature`,
      "feature file"
    );
  }, [featureFile, serviceName, capitalize, downloadFile]);












































































  const renderFieldCheckboxes = useCallback(
    (obj, path = "") => {
      return Object.entries(obj).map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          return (
            <div key={fullPath} style={{ marginLeft: path ? 20 : 0 }}>
              <strong>{key}</strong>
              <div>{renderFieldCheckboxes(value, fullPath)}</div>
            </div>
          );
        } else {
          return (
            <label key={fullPath} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedRequestFields.includes(fullPath)}
                onChange={() => toggleField(fullPath)}
              />{" "}
              {fullPath}
            </label>
          );
        }
      });
    },
    [selectedRequestFields, toggleField]
  );

  const selectAllFields = useCallback(() => {
    setSelectedRequestFields(getAllFieldPaths(parsedRequestBody));
  }, [getAllFieldPaths, parsedRequestBody]);

  const deselectAllFields = useCallback(() => setSelectedRequestFields([]), []);


  const copyToClipboard = useCallback(
    (text, successMessage = "Code copied to clipboard!") => {
      if (!text) {
        toast.error("Nothing to copy!", {
          position: TOAST_POSITION,
          autoClose: TOAST_AUTO_CLOSE,
        });
        return;
      }

      if(navigator?.clipboard?.writeText){
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success(successMessage, {
            position: TOAST_POSITION,
            autoClose: TOAST_AUTO_CLOSE,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        })
        .catch((err) => {
          console.error("clipboard API failed ", err);
          fallbackCopy(text, successMessage);
        });
      } else {
        fallbackCopy(text, successMessage);
      }

function fallbackCopy(text, successMessage) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    
    if (successful) {
      toast.success(successMessage, {
        position: TOAST_POSITION,
        autoClose: TOAST_AUTO_CLOSE,  
      });
    }else {
      throw new Error("Fallback  Copy failed");
    }
  } catch (err) {
    console.error("Fallback Copy error", err);
    toast.error("Failed to copy code!", {
      position: TOAST_POSITION,
      autoClose: TOAST_AUTO_CLOSE,
    });
  }
}
    },
[]
  );

  const handleServiceCopy = useCallback(() => {
    copyToClipboard(visibleGeneratedCode, "Service code copied!");
  }, [copyToClipboard, visibleGeneratedCode]);

  const handleStepCopy = useCallback(() => {
    copyToClipboard(visibleStepDefinition, "Step Definition copied!");
  }, [copyToClipboard, visibleStepDefinition]);

  const handleFeatureCopy = useCallback(() => {
    copyToClipboard(visibleFeatureFile, "Feature File copied!");
  }, [copyToClipboard, visibleFeatureFile]);

  const nextStep = useCallback(() => {
    // Basic validation for Step 1 before moving to Step 2
    if (currentStep === 1) {
      if (!serviceName.trim() || !apiEndpoint.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please fill in Service Name and API Endpoint URL before proceeding.",
        });
        return;
      } else {
        // Format JSON
        if (requestBody && responseBody && errorResponseBody) {
          formatJson(requestBody, setRequestBody, "request");
          formatJson(responseBody, setResponseBody, "response");
          formatJson(errorResponseBody, setErrorResponseBody, "error");
        }
      }
    }
    setCurrentStep((prev) => prev + 1);
  }, [currentStep, serviceName, apiEndpoint]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content-columns">
            <div className="left-column">
              <h3>Import API Details</h3>
              <ImportFromSwagger onReset={clearAll} onData={handleData} />
              {/* <UploadJSON /> */}
              <p className="import-swagger-info">
              Amplify your API tests with ouor autonomous tool, Go fast. Go smart. Go API.
            </p>
            </div>
            <div className="right-column">
              <h3>Manual API Details Entry</h3>
              <div className="input-group">
                <label htmlFor="serviceName">Service Name</label>
                <input
                  type="text"
                  id="serviceName"
                  className="input-field"
                  value={serviceName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.includes(" ")) {
                      setServiceName(value);
                    }
                  }}
                  placeholder="Enter service name (no spaces)"
                />
              </div>
              <div className="input-group">
                <label htmlFor="apiEndpoint">API Endpoint URL</label>
                <input
                  type="url"
                  id="apiEndpoint"
                  className="input-field"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="/objects"
                />
              </div>
              <div className="input-group">
                <label htmlFor="requestType">Request Type:</label>
                <select
                  id="requestType"
                  className="input-field"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                  <option>HEAD</option>
                  <option>OPTIONS</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content-columns">
            <div className="left-column">
              <h3>Request Configuration</h3>
              <CollapsibleSection
                title="Headers"
                isOpen={accordionState.bulkHeaders}
                onToggle={() => toggleAccordion("bulkHeaders")}
              >
                <div className="header-input-container">
                  <input
                    type="text"
                    className="header-input-field"
                    placeholder="Key"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                  />
                  <input
                    type="text"
                    className="header-input-field"
                    placeholder="Value"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                  />
                  <button onClick={addHeader} className="add-button">
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="header-list">
                  {headers.map((header, index) => (
                    <div key={index} className="header-item">
                      <span>
                        {header.key}: {header.value}
                      </span>
                      <button
                        onClick={() =>
                          setHeaders((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="delete-button"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                <h4 style={{ marginTop: "20px" }}>
                  Bulk Headers (Key:Value per line)
                </h4>
                <textarea
                  className="text-area-field"
                  rows="5"
                  value={bulkHeaders}
                  onChange={(e) => setBulkHeaders(e.target.value)}
                  placeholder="Content-Type: application/json&#10;Authorization: Bearer xyz"
                ></textarea>
                <div
                  className="button-group"
                  style={{ justifyContent: "flex-end" }}
                >
                  <button onClick={bulkAddHeaders} className="tertiary-button">
                    Bulk Add
                  </button>
                </div>
              </CollapsibleSection>
              <CollapsibleSection
                title="Request Body"
                isOpen={accordionState.requestBody}
                onToggle={() => toggleAccordion("requestBody")}
              >
                {viewMode.request === "edit" ? (
                  <div className="input-group">
                    <textarea
                      className="text-area-field"
                      rows="10"
                      value={requestBody}



                      onChange={(e) => {
                        setRequestBody(e.target.value);
                        setIsRequestBodyFormatted(false);
                      }}
                      placeholder="Enter JSON request body"
                    ></textarea>
                    <div className="button-group">
                      <button
                        onClick={() =>
                          formatJson(requestBody, setRequestBody, "request")
                        }
                        className="primary-button"
                      >
                        <FaCode /> Format JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="code-input-container">
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      showLineNumbers
                    >
                      {requestBody}
                    </SyntaxHighlighter>
                    <div className="code-actions">
                      <button
                        onClick={() => toggleEditMode("request")}
                        className="action-button"
                        disabled={requestType === "GET"}
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                )}
                {isRequestBodyFormatted && (
                  <div className="field-selection-container">
                    <h4>Select Fields for PayLoad/Examples:</h4>
                    <div
                      className="button-group"
                      style={{ marginBottom: "10px" }}
                    >
                      <button
                        onClick={selectAllFields}
                        className="secondary-button"
                      >
                        <BiSelectMultiple /> Select All
                      </button>
                      <button
                        onClick={deselectAllFields}
                        className="secondary-button"
                      >
                        <FaTrash /> Deselect All
                      </button>
                    </div>
                    <div className="checkbox-container">
                      {renderFieldCheckboxes(parsedRequestBody)}
                    </div>
                  </div>
                )}
              </CollapsibleSection>
            </div>
            <div className="right-column">
              <h3>Response Configuration</h3>
              <CollapsibleSection
                title={`Success Response Body (Status: ${responseCode})`}
                isOpen={accordionState.successResponse}
                onToggle={() => toggleAccordion("successResponse")}
              >
                {viewMode.response === "edit" ? (
                  <div className="input-group">
                    <textarea
                      className="text-area-field"
                      rows="10"
                      value={responseBody}
                      onChange={(e) => setResponseBody(e.target.value)}
                      placeholder="Enter JSON success response body"
                    ></textarea>
                    <div className="button-group">
                      <button
                        onClick={() =>
                          formatJson(responseBody, setResponseBody, "response")
                        }
                        className="primary-button"
                      >
                        <FaCode /> Format JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="code-input-container">
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      showLineNumbers
                    >
                      {responseBody}
                    </SyntaxHighlighter>
                    <div className="code-actions">
                      <button
                        onClick={() => toggleEditMode("response")}
                        className="action-button"
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </CollapsibleSection>
              <CollapsibleSection
                title="Error Response Body (e.g., Status: 400, 500)"
                isOpen={accordionState.errorResponse}
                onToggle={() => toggleAccordion("errorResponse")}
              >
                {viewMode.error === "edit" ? (
                  <div className="input-group">
                    <textarea
                      className="text-area-field"
                      rows="10"
                      value={errorResponseBody}
                      onChange={(e) => setErrorResponseBody(e.target.value)}
                      placeholder="Enter JSON error response body"
                    ></textarea>
                    <div className="button-group">
                      <button
                        onClick={() =>
                          formatJson(
                            errorResponseBody,
                            setErrorResponseBody,
                            "error"
                          )
                        }
                        className="primary-button"
                      >
                        <FaCode /> Format JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="code-input-container">
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      showLineNumbers
                    >
                      {errorResponseBody}
                    </SyntaxHighlighter>
                    <div className="code-actions">
                      <button
                        onClick={() => toggleEditMode("error")}
                        className="action-button"
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </CollapsibleSection>
              {/* <div className="input-group">
                <label>Response Code</label>
                <select
                  value={responseCode}
                  onChange={(e) => setResponseCode(e.target.value)}
                  className="input-field"
                >
                  {[
                    100, 101, 102, 200, 201, 202, 204, 400, 401, 403, 404, 500,
                    502, 503,
                  ].map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>
          </div>
        );
      case 3:
        return (
          <>
            <div className="step-content-columns">
              <div className="left-column">
                <h3>Generated Service Code (`.java`)</h3>
                <div className="code-output-container">
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    showLineNumbers
                  >
                    {visibleGeneratedCode}
                     {/* {generatedCode} */}
                  </SyntaxHighlighter>
                  <div className="code-actions">
                    <button
                      onClick={handleServiceCopy}
                      className="action-copy-button"
                    >
                      <FaCopy /> Copy
                    </button>
                    <button onClick={downloadCode} className="action-button">
                      <FaDownload /> Download
                    </button>





                  </div>
                </div>
              </div>
              <div className="middle-column">
                <h3>Generated Step Definition (`.java`)</h3>
                <div className="code-output-container">
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    showLineNumbers
                  >
                    {visibleStepDefinition}
                     {/* {stepDefinition} */}
                  </SyntaxHighlighter>
                  <div className="code-actions">
                    <button onClick={handleStepCopy} className="action-copy-button">
                      <FaCopy /> Copy
                    </button>
                    <button
                      onClick={downloadStepDefinition}
                      className="action-button"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              </div>
              <div className="right-column">
                <h3>Generated Feature File (`.feature`)</h3>
                <div className="code-output-container">
                  <SyntaxHighlighter
                    language="gherkin"
                    style={vscDarkPlus}
                    showLineNumbers
                  >
                    {visibleFeatureFile}
                    {/* {featureFile} */}
                  </SyntaxHighlighter>
                  <div className="code-actions">
                    <button
                      onClick={handleFeatureCopy}
                      className="action-copy-button"
                    >
                      <FaCopy /> Copy
                    </button>
                    <button
                      onClick={downloadFeatureFile}
                      className="action-button"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="final-step-info">
             Automation made easy Instantly dowload or copy complete automation code and save your time and effort!
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <ToastContainer
        position={TOAST_POSITION}
        autoClose={TOAST_AUTO_CLOSE}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* <TitleBar title="API Auto Code Gen" /> */}

      <TitleBar title="API Go"
        subtitle="Go Fast.  Go Smart. Go API."
        onClick={() => setCurrentStep(1)}s
        logoSrc="/images/l2.png"
      />


      {/* Step Indicators */}
      <div className="stepper-progress">
        <div
          className={`step-indicator ${currentStep === 1 ? "active" : ""} ${
            currentStep > 1 ? "completed" : ""
          }`}
          onClick={() => setCurrentStep(1)}
        >
          API Details
        </div>
        <div
          className={`step-indicator ${currentStep === 2 ? "active" : ""} ${
            currentStep > 2 ? "completed" : ""
          }`}

          onClick={() => {
            //
            if(currentStep==1)
            {
              //
              //
              return;
            }

            setCurrentStep(2);

          }}

        >
          Request/Response
        </div>
        <div className={`step-indicator ${currentStep === 3 ? "active" : ""}`}>
           Generated Code
        </div>
      </div>

      <div className="step-content">{renderStep()}</div>

      <div className="action-buttons">
       

        {/* {currentStep > 1 && currentStep <= 3 && (
          <button type="button" onClick={prevStep} className="secondary-button">
           <FaArrowLeft /> Previous
          </button>
        )} */}
        {currentStep !== 3 && (
         <button type="button" onClick={clearAll} className="clear-button">
          Clear
        </button>)}
        {currentStep < 3 && currentStep !== 2 && (
          <button type="button" onClick={nextStep} className="primary-button">
            Next <FaArrowRight />
          </button>
        )}
        {currentStep === 2 && (
          <button
            type="button"
            onClick={generateCode}
            className="generate-button"
          >
            <FaCode /> Generate Code
          </button>
        )}

         {currentStep == 3 && (
         <button type="button" onClick={clearAll} className="clear-button">
          Reset All 
            </button>)}

            {currentStep === 3 && (
              <button onClick={() => {
                downloadFeatureFile();
                downloadStepDefinition();
                downloadCode();
              }}
      className="generate-button"
      ><FaDownload /> Download All
        </button>
            )}
      </div>
      <Footer footerText="Developed by GETS (Group Engineering Testing Services)" />

    </div>
  );
}

export default App;

