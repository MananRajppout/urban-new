import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/router';
import toast from "react-hot-toast";
import "../../styles/Dialog.css";
import {
  addPurchasedTwilioNumber,
  buyTwilioNumber,
} from "@/lib/api/ApiAiAssistant";
import { debounce } from "lodash";

export default function BuyPhoneNoDialog({
  isOpen,
  setOpenPhoneDialog,
  getBoughtPhoneNumber,
}) {
  const [countryCode, setCountryCode] = useState("");
  const [phoneCosts, setPhoneCosts] = useState([]);

  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [useExistingNumber, setUseExistingNumber] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter(); 

    

  const [isSaving, setIsSaving] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Fetch Countries and Phone Costs
  useEffect(() => {
   
    const fetchCountries = async () => {
      try {
        const cachedData = localStorage.getItem("countries");
        const cachedTimestamp = localStorage.getItem("countriesTimestamp");
        const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
        if (cachedData && cachedTimestamp && Date.now() - cachedTimestamp < expiryTime) {
          setCountries(JSON.parse(cachedData));
          setIsLoading(false);
        } else {
          const countriesRes = await fetch("https://restcountries.com/v3.1/all");
          const countriesData = await countriesRes.json();
          const formattedData = countriesData.map((country) => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags?.png || "",
          }));
  
          // Save to localStorage with timestamp
          localStorage.setItem("countries", JSON.stringify(formattedData));
          localStorage.setItem("countriesTimestamp", Date.now());
  
          setCountries(formattedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    async function fetchPhoneCosts() {
      try {
        const cachedData = localStorage.getItem("phoneCosts");
        const cachedTimestamp = localStorage.getItem("phoneCostsTimestamp");
        const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
    
        if (cachedData && cachedTimestamp && Date.now() - cachedTimestamp < expiryTime) {
          setPhoneCosts(JSON.parse(cachedData));
          setIsLoading(false);
        } else {
          const phoneCostsRes = await fetch(`${backendUrl}/api/telnyx/fetch-countries-and-costs`);
          const phoneCostsData = await phoneCostsRes.json();
    
          // Save data and timestamp to localStorage
          localStorage.setItem("phoneCosts", JSON.stringify(phoneCostsData.data));
          localStorage.setItem("phoneCostsTimestamp", Date.now());
    
          setPhoneCosts(phoneCostsData.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching phone costs:", error);
        setIsError(true);
        setIsLoading(false);
      }
    }
    
    // Fetch both datasets
    fetchCountries();
    fetchPhoneCosts();
  }, []);

  // Merge Countries and Phone Costs Data
  useEffect(() => {
    if (countries.length && phoneCosts.length) {
      const mergedCountries = countries
        .map((country) => {
          const cost = phoneCosts.find((c) => c.country_code === country.code);
          return cost
            ? { ...country, cost_information: cost.cost_information }
            : null;
        })
        .filter((country) => country !== null);

      setFilteredCountries(mergedCountries);
    }
  }, [countries, phoneCosts]);

  // Enhanced Search Function with Debounce
  const handleSearch = useCallback(
    debounce((term) => {
      const searchTermLowerCase = term.toLowerCase();
      setFilteredCountries(
        countries
          .map((country) => {
            const cost = phoneCosts.find(
              (c) => c.country_code === country.code
            );
            return cost
              ? { ...country, cost_information: cost.cost_information }
              : null;
          })
          .filter(
            (country) =>
              country &&
              country.name.toLowerCase().includes(searchTermLowerCase)
          )
      );
    }, 300),
    [countries, phoneCosts]
  );

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  // Close Dialog
  function onDialogClose() {
    setOpenPhoneDialog(false);
    setCountryCode("");
    setPhoneNumber("");
  }

  async function save() {
    if (useExistingNumber && !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }
    try {
      let res;
      setIsSaving(true);
      if (phoneNumber) {
        res = await addPurchasedTwilioNumber(phoneNumber);
      } else {
        res = await buyTwilioNumber(countryCode);
      }
      /**
       * here we are calling the addcard when the user has no card available
       */
      if (res.code === 400 && res.message === "Please add a credit card to buy a number.") {
        handleAddClick();
        
      } 
      else if (res.code === 500 && res.message === "Something went wrong"){
        toast.error(res.message);
      }
      else if (res.code === 200 && res.message ===  "Phone number Added successfully"){
        toast.success(res.message);
      }
      else{
        toast.error("please check your number");
      }
      getBoughtPhoneNumber();
      onDialogClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  }

  // this function do navigate on the payment method
  const handleAddClick = () => {
    router.push('/ai-assistant/billing?showDialog=true'); // Navigate to the desired route
  };


  // Copy to Clipboard
  function copy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) =>
            e.target.className === "dialog-outer" && onDialogClose()
          }
        >
          <div className="dialog">
            {!useExistingNumber ? (
              <>
                <h2 className="center-title">Buy Phone Number</h2>
                <div className="input-container">
                  {isLoading ? (
                    <p>Loading countries...</p>
                  ) : isError ? (
                    <p>Error loading countries</p>
                  ) : (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-selected"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        
                        {countryCode
                          ? filteredCountries.find(
                            (country) => country.code === countryCode
                          )?.name
                          : "Select Country (Optional)"}
                
                      </div>
                      {dropdownOpen && (
                        <div className="custom-select-dropdown">
                          <div>
                            <input
                              type="text"
                              placeholder="Search country (Optional)"
                              value={searchTerm}
                              onChange={handleSearchInput}
                              className="custom-select-search"
                            />
                            <span onClick={ ()=>setDropdownOpen(false)} className="country-down-arrow">&times;</span>
                          </div>
                          <div className="custom-select-option-container">
                            {filteredCountries.map((country) => (
                              <div
                                key={country.code}
                                className="custom-select-option"
                                onClick={() => {
                                  setCountryCode(country.code);
                                  setDropdownOpen(false);
                                }}
                              >
                                {country.flag && (
                                  <img
                                    src={country.flag}
                                    alt={`${country.name} flag`}
                                    width={20}
                                    height={15}
                                    style={{ marginRight: "8px" }}
                                  />
                                )}
                                {country.name}
                                {country.cost_information && (
                                  <span style={{ marginLeft: "auto" }}>
                                    {`$${parseFloat(
                                      country.cost_information.monthly_cost
                                    ).toFixed(2)} ${
                                      country.cost_information.currency
                                    }`}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p>
                  This number incurs a monthly fee of{" "}
                  {countryCode &&
                  filteredCountries.find(
                    (country) => country.code === countryCode
                  )?.cost_information ? (
                    <>
                      <b>
                        $
                        {parseFloat(
                          filteredCountries.find(
                            (country) => country.code === countryCode
                          )?.cost_information.monthly_cost
                        ).toFixed(2)}
                      </b>
                      {filteredCountries.find(
                        (country) => country.code === countryCode
                      )?.cost_information.upfront_cost && (
                        <>
                          {" with an upfront cost of "}
                          <b>
                            $
                            {parseFloat(
                              filteredCountries.find(
                                (country) => country.code === countryCode
                              )?.cost_information.upfront_cost
                            ).toFixed(2)}
                          </b>
                        </>
                      )}
                    </>
                  ) : (
                    <b>$2.00</b>
                  )}
                </p>
                <p className="note center">
                  Already have a number on Telnyx?{" "}
                  <button
                    className="ghost-button"
                    onClick={() => setUseExistingNumber(true)}
                  >
                    Click here
                  </button>
                </p>
              </>
            ) : (
              <>
                <h4>Add your telnyx phone number :</h4>
                <div className="input-container ">
                  <input
                    type="text"
                    placeholder="Your telnyx number with country code (e.g., +919876543210)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-field"
                  />
                </div>
                <h4>
                  Please configure your Telnyx account with the provided URL:
                </h4>
                <div className="input-container ">
                  <input
                    type="text"
                    value={"https://backend.urbanchat.ai/api/telnyx-webhook"}
                    className="text-field"
                  />
                  <button
                    onClick={() =>
                      copy("hhttps://backend.urbanchat.ai/api/telnyx-webhook")
                    }
                    className="copy-btn hover"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z" />
                    </svg>
                  </button>
                </div>
                <p className="note center">
                  Not have a number on Telnyx?{" "}
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setUseExistingNumber(false);
                      setCountryCode("");
                      setPhoneNumber("");
                    }}
                  >
                    Click here
                  </button>
                </p>
              </>
            )}
            <div className="page">
              <div className="flex-center flex-gap " style={{ margin: 0 }}>
                <button onClick={onDialogClose} className="outline">
                  Cancel
                </button>
                <button onClick={save} className="primary hover">
                  {isSaving ? (
                    <span className="loading mini"></span>
                  ) : useExistingNumber ? (
                    "Add"
                  ) : (
                    "Buy"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

}




