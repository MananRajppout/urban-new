import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import "../../styles/Dialog.css";
import {
  addPurchasedTwilioNumber,
  buyPlivoNumber,
  buyTwilioNumber,
  searchPhoneNumbers,
} from "@/lib/api/ApiAiAssistant";
import { debounce } from "lodash";
import Dropdown from "../Widget/Dropdown";

export default function BuyPhoneNoDialog2({
  isOpen,
  setOpenPhoneDialog,
  getBoughtPhoneNumber,
}) {
  const [countryCode, setCountryCode] = useState("IN");
  const [numberList, setNumberList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [useExistingNumber, setUseExistingNumber] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  async function getPhoneNumbersForPurchase() {
    try {
      setNumberList([])
      const numbers = await searchPhoneNumbers(countryCode || "IN");
      console.log("numbers", numbers.data.numbers);

      setNumberList(numbers.data.numbers || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching phone costs:", error);
      setIsError(true);
      setIsLoading(false);
    }
  }

  // Fetch Countries and Phone Costs
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cachedData = localStorage.getItem("countries");
        const cachedTimestamp = localStorage.getItem("countriesTimestamp");
        const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (
          cachedData &&
          cachedTimestamp &&
          Date.now() - cachedTimestamp < expiryTime
        ) {
          setCountries(JSON.parse(cachedData));
          setIsLoading(false);
        } else {
          const countriesRes = await fetch(
            "https://restcountries.com/v3.1/all"
          );
          const countriesData = await countriesRes.json();
          let formattedData = countriesData.map((country) => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags?.png || "",
          }));

          // only india
          formattedData = formattedData.filter(
            (country) => country.code === "IN" || country.code === "US"
          );
          console.log("formattedData", formattedData);

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
    // Fetch both datasets
    fetchCountries();
  }, []);

  useEffect(() => {
    getPhoneNumbersForPurchase();
  }, [countryCode]);

  // Merge Countries and Phone Costs Data
  useEffect(() => {
    setFilteredCountries(countries);
  }, [countries]);

  // Enhanced Search Function with Debounce
  const handleSearch = useCallback(
    debounce((term) => {
      const searchTermLowerCase = term.toLowerCase();
      setFilteredCountries(
        countries.filter(
          (country) =>
            country && country.name.toLowerCase().includes(searchTermLowerCase)
        )
      );
    }, 300),
    [countries]
  );

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  // Close Dialog
  function onDialogClose() {
    setOpenPhoneDialog(false);
    setCountryCode("IN");
    setPhoneNumber("");
  }

  async function save() {
    if (!countryCode && !phoneNumber) {
      toast.error("Please enter your phone number and country code");
      return;
    }
    try {
      setIsSaving(true);

      const res = await buyPlivoNumber(countryCode, phoneNumber);
      console.log("res", res);
      if (
        res.code === 400 &&
        res.message === "Please add a credit card to buy a number."
      ) {
        handleAddClick();
      } else if (res.code === 500 && res.message === "Something went wrong") {
        toast.error(res.message);
      } else if (res.code == 200) {
        toast.success(res.message);
      } else {
        toast.error("please check your number");
      }
      getBoughtPhoneNumber();
      onDialogClose();
      getPhoneNumbersForPurchase();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  }

  // this function do navigate on the payment method
  const handleAddClick = () => {
    router.push("/ai-assistant/billing?showDialog=true"); // Navigate to the desired route
  };

  // Copy to Clipboard
  function copy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  const countryDropdownItems = useMemo(() => {
    return countries.map((country) => ({
      name: country.name,
      value: country.code,
      icon: country.flag,
    }));
  }, [countries]);

  const numberDropdownItems = useMemo(() => {
    return numberList.map((number) => {
      return {
        name: number.id,
        value: number.id,
        number,
        cost:`${countryCode === "IN" ? "₹" : "$"}${number.monthlyRate}`,
      };
    });
  }, [numberList,countryCode]);

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
            <h2 className="center-title">Buy Phone Number</h2>
            <div className="input-container">
              {isLoading ? (
                <p>Loading countries...</p>
              ) : isError ? (
                <p>Error loading countries</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="input-label">Select Country</span>
                    <Dropdown
                      placeholder={"Countries"}
                      items={countryDropdownItems}
                      currentValue={countryCode}
                      onSelect={(value) => setCountryCode(value)}
                      onRender={(item) => (
                        <div className="flex items-center gap-1">
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-4 h-4"
                          />
                          {item.name}
                        </div>
                      )}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="input-label">Select number</span>
                    <Dropdown
                      placeholder={"Number"}
                      items={numberDropdownItems}
                      currentValue={phoneNumber}
                      onSelect={(value) => setPhoneNumber(value)}
                      onRender={(item) => (
                        <div className="">
                          <span className="font-medium text-white-800">
                            {item.name}
                          </span>
                          <span className="text-gray-500"> - </span>
                          <span className="font-semibold text-blue-600">
                            {item.cost}/month
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="page">
              <div className="flex-center flex-gap " style={{ margin: 0 }}>
                <button onClick={onDialogClose} className="outline">
                  Cancel
                </button>
                <button onClick={save} className="primary hover">
                  {isSaving ? <span className="loading mini"></span> : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
