"use client"

import React, { useMemo } from "react"
import { Country, State, City } from "country-state-city"
import SearchableSelect, { type SelectOption, type SelectValue } from "./SearchableSelect"

export interface CountryStateCityErrors {
  country?: string | { message?: string }
  state?: string | { message?: string }
  city?: string | { message?: string }
}

export interface CountryStateCitySelectProps {
  country?: string
  state?: string
  city?: string
  onCountryChange: (countryName: string, option?: SelectOption) => void
  onStateChange: (stateName: string, option?: SelectOption) => void
  onCityChange: (cityName: string, option?: SelectOption) => void
  required?: boolean
  errors?: CountryStateCityErrors
  className?: string
  disabled?: boolean
}

export function CountryStateCitySelect({
  country = "",
  state = "",
  city = "",
  onCountryChange,
  onStateChange,
  onCityChange,
  required = false,
  errors = {},
  className = "",
  disabled = false,
}: CountryStateCitySelectProps) {
  // All countries cached in memory
  const allCountries = useMemo(() => Country.getAllCountries(), [])

  const countryOptions = useMemo<SelectOption[]>(
    () =>
      allCountries.map((c) => ({
        label: c.name,
        name: c.name,
        value: c.name,
        isoCode: c.isoCode,
        flag: c.flag,
        description: c.currency ? `Currency: ${c.currency}` : undefined,
      })),
    [allCountries]
  )

  // Derived active ISO codes directly from current props (no cascading effects)
  const activeCountryIso = useMemo(() => {
    if (!country) return ""
    const match = allCountries.find(
      (c) =>
        c.name.toLowerCase() === country.toLowerCase() ||
        c.isoCode.toLowerCase() === country.toLowerCase()
    )
    return match?.isoCode || ""
  }, [country, allCountries])

  // States of currently active country
  const stateOptions = useMemo<SelectOption[]>(() => {
    if (!activeCountryIso) return []
    return State.getStatesOfCountry(activeCountryIso).map((s) => ({
      label: s.name,
      name: s.name,
      value: s.name,
      isoCode: s.isoCode,
    }))
  }, [activeCountryIso])

  const activeStateIso = useMemo(() => {
    if (!activeCountryIso || !state) return ""
    const match = State.getStatesOfCountry(activeCountryIso).find(
      (s) =>
        s.name.toLowerCase() === state.toLowerCase() ||
        s.isoCode.toLowerCase() === state.toLowerCase()
    )
    return match?.isoCode || ""
  }, [activeCountryIso, state])

  // Cities of currently active country and state
  const cityOptions = useMemo<SelectOption[]>(() => {
    if (!activeCountryIso || !activeStateIso) return []
    return City.getCitiesOfState(activeCountryIso, activeStateIso).map((c) => ({
      label: c.name,
      name: c.name,
      value: c.name,
    }))
  }, [activeCountryIso, activeStateIso])

  // Handlers
  const handleCountrySelect = (val: SelectValue, opt?: SelectOption | SelectOption[]) => {
    const selectedOpt = Array.isArray(opt) ? opt[0] : opt
    const countryName = String(val || "")
    onCountryChange(countryName, selectedOpt)

    // Reset dependent state and city
    onStateChange("", undefined)
    onCityChange("", undefined)
  }

  const handleStateSelect = (val: SelectValue, opt?: SelectOption | SelectOption[]) => {
    const selectedOpt = Array.isArray(opt) ? opt[0] : opt
    const stateName = String(val || "")
    onStateChange(stateName, selectedOpt)

    // Reset dependent city
    onCityChange("", undefined)
  }

  const handleCitySelect = (val: SelectValue, opt?: SelectOption | SelectOption[]) => {
    const selectedOpt = Array.isArray(opt) ? opt[0] : opt
    const cityName = String(val || "")
    onCityChange(cityName, selectedOpt)
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-3 ${className}`}>
      {/* 1. Country Select */}
      <SearchableSelect
        label="Country"
        placeholder="Select Country"
        options={countryOptions}
        value={country}
        onChange={handleCountrySelect}
        disabled={disabled}
        required={required}
        error={errors.country}
      />

      {/* 2. State Select */}
      <SearchableSelect
        label="State / Province"
        placeholder={
          !activeCountryIso
            ? "First select country"
            : stateOptions.length === 0
            ? "No states available"
            : "Select State"
        }
        options={stateOptions}
        value={state}
        onChange={handleStateSelect}
        disabled={disabled || !activeCountryIso || stateOptions.length === 0}
        required={required}
        error={errors.state}
      />

      {/* 3. City Select */}
      <SearchableSelect
        label="City"
        placeholder={
          !activeStateIso
            ? "First select state"
            : cityOptions.length === 0
            ? "No cities available"
            : "Select City"
        }
        options={cityOptions}
        value={city}
        onChange={handleCitySelect}
        disabled={disabled || !activeStateIso || cityOptions.length === 0}
        required={required}
        error={errors.city}
      />
    </div>
  )
}

export default CountryStateCitySelect
