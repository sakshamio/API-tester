"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Settings,
  BarChart3,
  Zap,
  TrendingUp,
  Activity,
  PieChartIcon,
  Clock,
  Waves,
  Gauge,
  Layers,
  Shuffle,
  Upload,
  Download,
  FileText,
  Save,
  FolderOpen,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts"

interface RequestConfig {
  url: string
  method: string
  headers: Record<string, string>
  body: string
  params: Record<string, string>
}

interface LoadTestConfig {
  requests: number
  concurrency: number
  duration: number
  pattern: "constant" | "ramp-up" | "burst" | "step" | "sawtooth" | "custom"
  rampDuration?: number
  burstSize?: number
  burstInterval?: number
  stepSize?: number
  stepDuration?: number
  customSequence?: number[]
  requestDelay?: number
  timeout?: number
  warmupRequests?: number
  // Chaos Engineering
  chaosEnabled?: boolean
  networkFailureRate?: number
  timeoutFailureRate?: number
  slowResponseRate?: number
  slowResponseDelay?: number
  randomErrorRate?: number
  networkJitter?: number
  packetLossRate?: number
  bandwidthLimit?: number
}

interface ConfigFile {
  name: string
  description?: string
  version?: string
  requestConfig: RequestConfig
  loadTestConfig: LoadTestConfig
  scenarios?: Array<{
    name: string
    description?: string
    [key: string]: any
  }>
  metadata?: {
    createdAt?: string
    createdBy?: string
    tags?: string[]
    environment?: string
  }
}

interface TestResult {
  status: number
  responseTime: number
  size: number
  timestamp: number
  requestIndex: number
  error?: string
  plannedTime?: number
  // Chaos Engineering
  chaosType?:
    | "network_failure"
    | "timeout"
    | "slow_response"
    | "random_error"
    | "jitter"
    | "packet_loss"
    | "bandwidth_limit"
  originalResponseTime?: number
  artificialDelay?: number
}

interface LoadTestResults {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  requestsPerSecond: number
  results: TestResult[]
  startTime: number
  endTime: number
  totalDuration: number
  plannedPattern: Array<{ time: number; requests: number }>
  // Chaos Engineering
  chaosMetrics?: {
    networkFailures: number
    timeoutFailures: number
    slowResponses: number
    randomErrors: number
    jitterEvents: number
    packetLossEvents: number
    bandwidthLimitEvents: number
    totalChaosEvents: number
    chaosImpactOnLatency: number
  }
}

interface AnalyticsData {
  percentiles: {
    p50: number
    p90: number
    p95: number
    p99: number
  }
  standardDeviation: number
  errorRate: number
  throughputOverTime: Array<{ time: number; rps: number; planned: number; timestamp: string }>
  responseTimeDistribution: Array<{ range: string; count: number }>
  statusCodeDistribution: Array<{ status: string; count: number; percentage: number }>
  latencyOverTime: Array<{ time: number; responseTime: number; timestamp: string }>
  // Chaos Engineering
  chaosAnalytics?: {
    chaosEventsByType: Array<{ type: string; count: number; percentage: number }>
    chaosImpactOverTime: Array<{ time: number; chaosEvents: number; avgLatencyImpact: number; timestamp: string }>
    normalVsChaosLatency: Array<{ type: "normal" | "chaos"; avgLatency: number; count: number }>
  }
}

const demoRequests = [
  {
    name: "Get Users",
    url: "https://jsonplaceholder.typicode.com/users",
    method: "GET",
    headers: {},
    body: "",
    params: {},
  },
  {
    name: "Create Post",
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Post",
      body: "This is a test post from our API tester",
      userId: 1,
    }),
    params: {},
  },
  {
    name: "Get Post by ID",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    method: "GET",
    headers: {},
    body: "",
    params: {},
  },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const loadPatterns = [
  { value: "constant", label: "Constant Load", icon: Gauge, description: "Steady request rate throughout the test" },
  { value: "ramp-up", label: "Ramp Up", icon: TrendingUp, description: "Gradually increase load over time" },
  { value: "burst", label: "Burst Traffic", icon: Zap, description: "Sudden spikes of high traffic" },
  { value: "step", label: "Step Pattern", icon: Layers, description: "Incremental load increases in steps" },
  { value: "sawtooth", label: "Sawtooth Wave", icon: Waves, description: "Oscillating load pattern" },
  { value: "custom", label: "Custom Sequence", icon: Shuffle, description: "Define your own request sequence" },
]

export default function APITester() {
  const [demoMode, setDemoMode] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(0)
  const [requestConfig, setRequestConfig] = useState<RequestConfig>({
    url: "",
    method: "GET",
    headers: {},
    body: "",
    params: {},
  })
  const [loadTestConfig, setLoadTestConfig] = useState<LoadTestConfig>({
    requests: 50,
    concurrency: 5,
    duration: 10,
    pattern: "constant",
    rampDuration: 30,
    burstSize: 20,
    burstInterval: 5,
    stepSize: 10,
    stepDuration: 10,
    customSequence: [10, 20, 30, 25, 15],
    requestDelay: 0,
    timeout: 30,
    warmupRequests: 5,
    // Chaos Engineering
    chaosEnabled: false,
    networkFailureRate: 5,
    timeoutFailureRate: 3,
    slowResponseRate: 10,
    slowResponseDelay: 2000,
    randomErrorRate: 2,
    networkJitter: 100,
    packetLossRate: 1,
    bandwidthLimit: 1000,
  })
  const [headersText, setHeadersText] = useState("")
  const [paramsText, setParamsText] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadTesting, setLoadTesting] = useState(false)
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResults | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [progress, setProgress] = useState(0)
  const [customSequenceText, setCustomSequenceText] = useState("10, 20, 30, 25, 15")
  const [currentConfigName, setCurrentConfigName] = useState("")
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseKeyValueText = (text: string): Record<string, string> => {
    const result: Record<string, string> = {}
    text.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":")
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join(":").trim()
      }
    })
    return result
  }

  const objectToKeyValueText = (obj: Record<string, string>): string => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")
  }

  const generateConfigFile = (): ConfigFile => {
    return {
      name: currentConfigName || "API Test Configuration",
      description: "Configuration exported from API Load Tester",
      version: "1.0",
      requestConfig: {
        ...requestConfig,
        headers: parseKeyValueText(headersText),
        params: parseKeyValueText(paramsText),
      },
      loadTestConfig: {
        ...loadTestConfig,
        customSequence: customSequenceText
          .split(",")
          .map((s) => Number.parseInt(s.trim()))
          .filter((n) => !isNaN(n)),
      },
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "API Load Tester",
        environment: "test",
      },
    }
  }

  const downloadConfig = () => {
    const config = generateConfigFile()
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(currentConfigName || "api-test-config").replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSampleConfig = async () => {
    try {
      const response = await fetch("/sample-config.json")
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "sample-api-config.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading sample config:", error)
      setUploadStatus("Error downloading sample config")
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const loadConfigFromFile = (config: ConfigFile) => {
    try {
      // Load request configuration
      if (config.requestConfig) {
        setRequestConfig({
          url: config.requestConfig.url || "",
          method: config.requestConfig.method || "GET",
          headers: config.requestConfig.headers || {},
          body: config.requestConfig.body || "",
          params: config.requestConfig.params || {},
        })

        // Update text fields
        setHeadersText(objectToKeyValueText(config.requestConfig.headers || {}))
        setParamsText(objectToKeyValueText(config.requestConfig.params || {}))
      }

      // Load load test configuration
      if (config.loadTestConfig) {
        setLoadTestConfig({
          requests: config.loadTestConfig.requests || 50,
          concurrency: config.loadTestConfig.concurrency || 5,
          duration: config.loadTestConfig.duration || 10,
          pattern: config.loadTestConfig.pattern || "constant",
          rampDuration: config.loadTestConfig.rampDuration || 30,
          burstSize: config.loadTestConfig.burstSize || 20,
          burstInterval: config.loadTestConfig.burstInterval || 5,
          stepSize: config.loadTestConfig.stepSize || 10,
          stepDuration: config.loadTestConfig.stepDuration || 10,
          customSequence: config.loadTestConfig.customSequence || [10, 20, 30, 25, 15],
          requestDelay: config.loadTestConfig.requestDelay || 0,
          timeout: config.loadTestConfig.timeout || 30,
          warmupRequests: config.loadTestConfig.warmupRequests || 5,
          chaosEnabled: config.loadTestConfig.chaosEnabled || false,
          networkFailureRate: config.loadTestConfig.networkFailureRate || 5,
          timeoutFailureRate: config.loadTestConfig.timeoutFailureRate || 3,
          slowResponseRate: config.loadTestConfig.slowResponseRate || 10,
          slowResponseDelay: config.loadTestConfig.slowResponseDelay || 2000,
          randomErrorRate: config.loadTestConfig.randomErrorRate || 2,
          networkJitter: config.loadTestConfig.networkJitter || 100,
          packetLossRate: config.loadTestConfig.packetLossRate || 1,
          bandwidthLimit: config.loadTestConfig.bandwidthLimit || 1000,
        })

        // Update custom sequence text
        if (config.loadTestConfig.customSequence) {
          setCustomSequenceText(config.loadTestConfig.customSequence.join(", "))
        }
      }

      // Set config name
      setCurrentConfigName(config.name || "")

      setUploadStatus(`Configuration "${config.name}" loaded successfully!`)
      setTimeout(() => setUploadStatus(null), 3000)
    } catch (error) {
      console.error("Error loading configuration:", error)
      setUploadStatus("Error loading configuration file")
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      setUploadStatus("Please upload a JSON file")
      setTimeout(() => setUploadStatus(null), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as ConfigFile
        loadConfigFromFile(config)
      } catch (error) {
        console.error("Error parsing JSON:", error)
        setUploadStatus("Invalid JSON file format")
        setTimeout(() => setUploadStatus(null), 3000)
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateLoadPattern = (config: LoadTestConfig): Array<{ time: number; requests: number }> => {
    const pattern: Array<{ time: number; requests: number }> = []
    const totalDuration = config.duration * 1000 // Convert to milliseconds
    const intervalMs = 1000 // 1 second intervals

    switch (config.pattern) {
      case "constant":
        for (let time = 0; time < totalDuration; time += intervalMs) {
          pattern.push({ time, requests: Math.round(config.requests / config.duration) })
        }
        break

      case "ramp-up":
        const rampDuration = (config.rampDuration || 30) * 1000
        for (let time = 0; time < totalDuration; time += intervalMs) {
          const progress = Math.min(time / rampDuration, 1)
          const maxRps = config.requests / config.duration
          pattern.push({ time, requests: Math.round(maxRps * progress) })
        }
        break

      case "burst":
        const burstSize = config.burstSize || 20
        const burstInterval = (config.burstInterval || 5) * 1000
        for (let time = 0; time < totalDuration; time += intervalMs) {
          const isBurstTime = Math.floor(time / burstInterval) % 2 === 0
          pattern.push({ time, requests: isBurstTime ? burstSize : 1 })
        }
        break

      case "step":
        const stepSize = config.stepSize || 10
        const stepDuration = (config.stepDuration || 10) * 1000
        for (let time = 0; time < totalDuration; time += intervalMs) {
          const stepNumber = Math.floor(time / stepDuration)
          pattern.push({ time, requests: stepSize * (stepNumber + 1) })
        }
        break

      case "sawtooth":
        const cycleTime = 20000 // 20 second cycles
        const maxRequests = (config.requests / config.duration) * 2
        for (let time = 0; time < totalDuration; time += intervalMs) {
          const cycleProgress = (time % cycleTime) / cycleTime
          const sawtoothValue = cycleProgress < 0.5 ? cycleProgress * 2 : 2 - cycleProgress * 2
          pattern.push({ time, requests: Math.round(maxRequests * sawtoothValue) })
        }
        break

      case "custom":
        const sequence = config.customSequence || [10, 20, 30, 25, 15]
        const sequenceDuration = totalDuration / sequence.length
        for (let time = 0; time < totalDuration; time += intervalMs) {
          const sequenceIndex = Math.floor(time / sequenceDuration)
          const requests = sequence[sequenceIndex] || sequence[sequence.length - 1]
          pattern.push({ time, requests })
        }
        break
    }

    return pattern
  }

  const calculatePercentile = (values: number[], percentile: number): number => {
    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sorted.length) return sorted[sorted.length - 1]
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  const calculateStandardDeviation = (values: number[], mean: number): number => {
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }

  const applyChaosEngineering = async (
    config: LoadTestConfig,
  ): Promise<{
    shouldFail: boolean
    chaosType?: TestResult["chaosType"]
    artificialDelay?: number
    errorStatus?: number
  }> => {
    if (!config.chaosEnabled) {
      return { shouldFail: false }
    }

    const random = Math.random() * 100

    // Network failure
    if (random < (config.networkFailureRate || 0)) {
      return {
        shouldFail: true,
        chaosType: "network_failure",
        errorStatus: 0,
      }
    }

    // Timeout failure
    if (random < (config.networkFailureRate || 0) + (config.timeoutFailureRate || 0)) {
      return {
        shouldFail: true,
        chaosType: "timeout",
        errorStatus: 0,
      }
    }

    // Random error responses
    if (random < (config.networkFailureRate || 0) + (config.timeoutFailureRate || 0) + (config.randomErrorRate || 0)) {
      const errorCodes = [500, 502, 503, 504, 429, 408]
      const errorStatus = errorCodes[Math.floor(Math.random() * errorCodes.length)]
      return {
        shouldFail: true,
        chaosType: "random_error",
        errorStatus,
      }
    }

    // Slow response
    if (
      random <
      (config.networkFailureRate || 0) +
        (config.timeoutFailureRate || 0) +
        (config.randomErrorRate || 0) +
        (config.slowResponseRate || 0)
    ) {
      const delay = (config.slowResponseDelay || 2000) + Math.random() * 1000
      return {
        shouldFail: false,
        chaosType: "slow_response",
        artificialDelay: delay,
      }
    }

    // Network jitter
    if (
      random <
      (config.networkFailureRate || 0) +
        (config.timeoutFailureRate || 0) +
        (config.randomErrorRate || 0) +
        (config.slowResponseRate || 0) +
        5
    ) {
      const jitter = Math.random() * (config.networkJitter || 100)
      return {
        shouldFail: false,
        chaosType: "jitter",
        artificialDelay: jitter,
      }
    }

    // Packet loss simulation (causes retries/delays)
    if (
      random <
      (config.networkFailureRate || 0) +
        (config.timeoutFailureRate || 0) +
        (config.randomErrorRate || 0) +
        (config.slowResponseRate || 0) +
        5 +
        (config.packetLossRate || 0)
    ) {
      const packetLossDelay = 200 + Math.random() * 800 // Simulate retry delays
      return {
        shouldFail: false,
        chaosType: "packet_loss",
        artificialDelay: packetLossDelay,
      }
    }

    return { shouldFail: false }
  }

  const simulateBandwidthLimit = (dataSize: number, bandwidthKbps: number): number => {
    if (!bandwidthKbps || bandwidthKbps <= 0) return 0

    // Calculate additional delay based on bandwidth limit
    const dataSizeKb = dataSize / 1024
    const transferTimeMs = (dataSizeKb / bandwidthKbps) * 1000
    const normalTransferTime = dataSizeKb * 0.1 // Assume normal transfer is very fast

    return Math.max(0, transferTimeMs - normalTransferTime)
  }

  const makeRequest = async (
    config: RequestConfig,
    requestIndex: number,
    plannedTime?: number,
  ): Promise<TestResult> => {
    const startTime = Date.now()
    let originalResponseTime = 0
    let artificialDelay = 0
    let chaosType: TestResult["chaosType"] | undefined

    try {
      // Apply chaos engineering
      const chaos = await applyChaosEngineering(loadTestConfig)

      if (chaos.shouldFail) {
        chaosType = chaos.chaosType

        if (chaos.chaosType === "network_failure") {
          throw new Error("Simulated network failure")
        }

        if (chaos.chaosType === "timeout") {
          await new Promise((resolve) => setTimeout(resolve, (loadTestConfig.timeout || 30) * 1000 + 1000))
          throw new Error("Simulated timeout")
        }

        if (chaos.chaosType === "random_error") {
          throw new Error(`Simulated ${chaos.errorStatus} error`)
        }
      }

      // Apply artificial delays for chaos scenarios
      if (chaos.artificialDelay) {
        artificialDelay = chaos.artificialDelay
        chaosType = chaos.chaosType
        await new Promise((resolve) => setTimeout(resolve, chaos.artificialDelay))
      }

      const url = new URL(config.url)
      Object.entries(parseKeyValueText(paramsText)).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      const options: RequestInit = {
        method: config.method,
        headers: {
          ...parseKeyValueText(headersText),
          ...config.headers,
        },
        signal: AbortSignal.timeout((loadTestConfig.timeout || 30) * 1000),
      }

      if (config.method !== "GET" && config.body) {
        options.body = config.body
      }

      const requestStartTime = Date.now()
      const response = await fetch(url.toString(), options)
      originalResponseTime = Date.now() - requestStartTime

      const text = await response.text()

      // Apply bandwidth limit simulation
      const bandwidthDelay = loadTestConfig.bandwidthLimit
        ? simulateBandwidthLimit(text.length, loadTestConfig.bandwidthLimit)
        : 0

      if (bandwidthDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, bandwidthDelay))
        artificialDelay += bandwidthDelay
        chaosType = chaosType || "bandwidth_limit"
      }

      const totalResponseTime = Date.now() - startTime

      return {
        status: response.status,
        responseTime: totalResponseTime,
        size: text.length,
        timestamp: startTime,
        requestIndex,
        plannedTime,
        chaosType,
        originalResponseTime: originalResponseTime,
        artificialDelay: artificialDelay,
      }
    } catch (error) {
      const totalResponseTime = Date.now() - startTime

      return {
        status: 0,
        responseTime: totalResponseTime,
        size: 0,
        timestamp: startTime,
        requestIndex,
        plannedTime,
        error: error instanceof Error ? error.message : "Unknown error",
        chaosType,
        originalResponseTime,
        artificialDelay,
      }
    }
  }

  const handleSingleRequest = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const url = new URL(requestConfig.url)
      Object.entries(parseKeyValueText(paramsText)).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      const options: RequestInit = {
        method: requestConfig.method,
        headers: parseKeyValueText(headersText),
      }

      if (requestConfig.method !== "GET" && requestConfig.body) {
        options.body = requestConfig.body
      }

      const startTime = Date.now()
      const res = await fetch(url.toString(), options)
      const responseTime = Date.now() - startTime

      let responseData
      const contentType = res.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json()
      } else {
        responseData = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        responseTime,
        size: JSON.stringify(responseData).length,
      })
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : "Request failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadTest = async () => {
    setLoadTesting(true)
    setLoadTestResults(null)
    setAnalytics(null)
    setProgress(0)

    // Update custom sequence from text
    if (loadTestConfig.pattern === "custom") {
      const sequence = customSequenceText
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))
      setLoadTestConfig((prev) => ({ ...prev, customSequence: sequence }))
    }

    const results: TestResult[] = []
    const startTime = Date.now()
    const plannedPattern = generateLoadPattern(loadTestConfig)
    let completedRequests = 0
    let requestIndex = 0

    // Warmup requests
    if (loadTestConfig.warmupRequests && loadTestConfig.warmupRequests > 0) {
      for (let i = 0; i < loadTestConfig.warmupRequests; i++) {
        await makeRequest(requestConfig, requestIndex++)
      }
    }

    // Execute load test according to pattern
    const testStartTime = Date.now()
    const testDuration = loadTestConfig.duration * 1000

    for (const patternPoint of plannedPattern) {
      const targetTime = testStartTime + patternPoint.time
      const currentTime = Date.now()

      // Wait until target time
      if (currentTime < targetTime) {
        await new Promise((resolve) => setTimeout(resolve, targetTime - currentTime))
      }

      // Execute requests for this time interval
      const requestPromises: Promise<TestResult>[] = []
      const requestsToSend = Math.min(patternPoint.requests, loadTestConfig.concurrency)

      for (let i = 0; i < requestsToSend; i++) {
        requestPromises.push(makeRequest(requestConfig, requestIndex++, patternPoint.time))

        // Add delay between requests if configured
        if (loadTestConfig.requestDelay && loadTestConfig.requestDelay > 0 && i < requestsToSend - 1) {
          await new Promise((resolve) => setTimeout(resolve, loadTestConfig.requestDelay))
        }
      }

      const batchResults = await Promise.allSettled(requestPromises)
      const successfulResults = batchResults
        .filter((result): result is PromiseFulfilledResult<TestResult> => result.status === "fulfilled")
        .map((result) => result.value)

      results.push(...successfulResults)
      completedRequests += successfulResults.length

      // Update progress based on time elapsed
      const timeProgress = Math.min((Date.now() - testStartTime) / testDuration, 1)
      setProgress(timeProgress * 100)

      // Break if test duration exceeded
      if (Date.now() - testStartTime >= testDuration) {
        break
      }
    }

    const endTime = Date.now()
    const totalDuration = endTime - testStartTime

    const successfulRequests = results.filter((r) => r.status >= 200 && r.status < 400).length
    const failedRequests = results.length - successfulRequests
    const responseTimes = results.map((r) => r.responseTime)
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const minResponseTime = Math.min(...responseTimes)
    const maxResponseTime = Math.max(...responseTimes)
    const requestsPerSecond = (results.length / totalDuration) * 1000

    const chaosResults = results.filter((r) => r.chaosType)
    const chaosMetrics = loadTestConfig.chaosEnabled
      ? {
          networkFailures: chaosResults.filter((r) => r.chaosType === "network_failure").length,
          timeoutFailures: chaosResults.filter((r) => r.chaosType === "timeout").length,
          slowResponses: chaosResults.filter((r) => r.chaosType === "slow_response").length,
          randomErrors: chaosResults.filter((r) => r.chaosType === "random_error").length,
          jitterEvents: chaosResults.filter((r) => r.chaosType === "jitter").length,
          packetLossEvents: chaosResults.filter((r) => r.chaosType === "packet_loss").length,
          bandwidthLimitEvents: chaosResults.filter((r) => r.chaosType === "bandwidth_limit").length,
          totalChaosEvents: chaosResults.length,
          chaosImpactOnLatency:
            chaosResults.reduce((sum, r) => sum + (r.artificialDelay || 0), 0) / Math.max(chaosResults.length, 1),
        }
      : undefined

    const loadTestResults: LoadTestResults = {
      totalRequests: results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      results,
      startTime: testStartTime,
      endTime,
      totalDuration,
      plannedPattern,
      chaosMetrics,
    }

    setLoadTestResults(loadTestResults)
    setAnalytics(generateAnalytics(loadTestResults))
    setLoadTesting(false)
    setProgress(100)
  }

  const generateAnalytics = (results: LoadTestResults): AnalyticsData => {
    const responseTimes = results.results.map((r) => r.responseTime)
    const successfulResults = results.results.filter((r) => r.status >= 200 && r.status < 400)

    // Calculate percentiles
    const percentiles = {
      p50: calculatePercentile(responseTimes, 50),
      p90: calculatePercentile(responseTimes, 90),
      p95: calculatePercentile(responseTimes, 95),
      p99: calculatePercentile(responseTimes, 99),
    }

    // Calculate standard deviation
    const standardDeviation = calculateStandardDeviation(responseTimes, results.averageResponseTime)

    // Calculate error rate
    const errorRate = (results.failedRequests / results.totalRequests) * 100

    // Generate throughput over time with planned vs actual
    const throughputOverTime: Array<{ time: number; rps: number; planned: number; timestamp: string }> = []
    const startTime = results.startTime
    const endTime = results.endTime
    const intervalMs = 1000 // 1 second intervals

    for (let time = startTime; time < endTime; time += intervalMs) {
      const requestsInInterval = results.results.filter(
        (r) => r.timestamp >= time && r.timestamp < time + intervalMs,
      ).length

      const timeOffset = time - startTime
      const plannedData = results.plannedPattern.find((p) => Math.abs(p.time - timeOffset) < 500)
      const plannedRequests = plannedData?.requests || 0

      throughputOverTime.push({
        time: Math.floor(timeOffset / 1000),
        rps: requestsInInterval,
        planned: plannedRequests,
        timestamp: new Date(time).toLocaleTimeString(),
      })
    }

    // Generate response time distribution
    const buckets = [0, 100, 200, 500, 1000, 2000, 5000, 10000]
    const responseTimeDistribution = buckets
      .map((bucket, index) => {
        const nextBucket = buckets[index + 1] || Number.POSITIVE_INFINITY
        const count = responseTimes.filter((rt) => rt >= bucket && rt < nextBucket).length
        return {
          range: nextBucket === Number.POSITIVE_INFINITY ? `${bucket}ms+` : `${bucket}-${nextBucket}ms`,
          count,
        }
      })
      .filter((bucket) => bucket.count > 0)

    // Generate status code distribution
    const statusCodes = results.results.reduce(
      (acc, result) => {
        const status = result.error ? "Error" : result.status.toString()
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusCodeDistribution = Object.entries(statusCodes).map(([status, count]) => ({
      status,
      count,
      percentage: (count / results.totalRequests) * 100,
    }))

    // Generate latency over time
    const latencyOverTime = results.results.map((result, index) => ({
      time: Math.floor((result.timestamp - startTime) / 1000),
      responseTime: result.responseTime,
      timestamp: new Date(result.timestamp).toLocaleTimeString(),
    }))

    // Chaos Engineering Analytics
    let chaosAnalytics = undefined

    if (loadTestConfig.chaosEnabled) {
      // Chaos events by type
      const chaosEvents = results.results.filter((r) => r.chaosType)
      const chaosEventsByType = chaosEvents.reduce(
        (acc, result) => {
          if (result.chaosType) {
            acc[result.chaosType] = (acc[result.chaosType] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

      const chaosEventsByTypeArray = Object.entries(chaosEventsByType).map(([type, count]) => ({
        type: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
        percentage: (count / results.totalRequests) * 100,
      }))

      // Chaos impact over time
      const chaosImpactOverTime: Array<{
        time: number
        chaosEvents: number
        avgLatencyImpact: number
        timestamp: string
      }> = []

      for (let time = startTime; time < endTime; time += intervalMs) {
        const chaosEventsInInterval = results.results.filter(
          (r) => r.timestamp >= time && r.timestamp < time + intervalMs && r.chaosType,
        )

        const avgLatencyImpact =
          chaosEventsInInterval.length > 0
            ? chaosEventsInInterval.reduce((sum, r) => sum + (r.artificialDelay || 0), 0) / chaosEventsInInterval.length
            : 0

        const timeOffset = time - startTime
        chaosImpactOverTime.push({
          time: Math.floor(timeOffset / 1000),
          chaosEvents: chaosEventsInInterval.length,
          avgLatencyImpact,
          timestamp: new Date(time).toLocaleTimeString(),
        })
      }

      // Normal vs Chaos latency comparison
      const normalRequests = results.results.filter((r) => !r.chaosType)
      const chaosRequests = results.results.filter((r) => r.chaosType)

      const normalAvgLatency =
        normalRequests.length > 0
          ? normalRequests.reduce((sum, r) => sum + r.responseTime, 0) / normalRequests.length
          : 0

      const chaosAvgLatency =
        chaosRequests.length > 0 ? chaosRequests.reduce((sum, r) => sum + r.responseTime, 0) / chaosRequests.length : 0

      const normalVsChaosLatency = [
        { type: "normal" as const, avgLatency: normalAvgLatency, count: normalRequests.length },
        { type: "chaos" as const, avgLatency: chaosAvgLatency, count: chaosRequests.length },
      ]

      chaosAnalytics = {
        chaosEventsByType: chaosEventsByTypeArray,
        chaosImpactOverTime,
        normalVsChaosLatency,
      }
    }

    return {
      percentiles,
      standardDeviation,
      errorRate,
      throughputOverTime,
      responseTimeDistribution,
      statusCodeDistribution,
      latencyOverTime,
      chaosAnalytics,
    }
  }

  const selectedPattern = loadPatterns.find((p) => p.value === loadTestConfig.pattern)

  const handleDemoToggle = (enabled: boolean) => {
    setDemoMode(enabled)
    if (enabled) {
      loadDemoRequest(0)
    } else {
      setRequestConfig({
        url: "",
        method: "GET",
        headers: {},
        body: "",
        params: {},
      })
      setHeadersText("")
      setParamsText("")
    }
  }

  const loadDemoRequest = (index: number) => {
    const demo = demoRequests[index]
    setSelectedDemo(index)
    setRequestConfig({
      url: demo.url,
      method: demo.method,
      headers: demo.headers,
      body: demo.body,
      params: demo.params,
    })
    setHeadersText(
      Object.entries(demo.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    )
    setParamsText(
      Object.entries(demo.params)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Load Tester</h1>
          <p className="text-muted-foreground">
            Test and analyze your APIs with advanced load patterns and comprehensive analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="demo-mode">Demo Mode</Label>
          <Switch id="demo-mode" checked={demoMode} onCheckedChange={handleDemoToggle} />
        </div>
      </div>

      {/* Configuration Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuration Management
          </CardTitle>
          <CardDescription>Save, load, and share your API test configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">Configuration Name</Label>
              <Input
                id="config-name"
                placeholder="My API Test Config"
                value={currentConfigName}
                onChange={(e) => setCurrentConfigName(e.target.value)}
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={downloadConfig} variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Export Config
              </Button>
            </div>

            <div className="flex flex-col justify-end">
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Config
              </Button>
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={downloadSampleConfig} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Sample Config
              </Button>
            </div>
          </div>

          {uploadStatus && (
            <div className="mt-4">
              <Badge variant={uploadStatus.includes("Error") ? "destructive" : "default"}>{uploadStatus}</Badge>
            </div>
          )}

          {currentConfigName && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="font-medium">Current Configuration: {currentConfigName}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {demoMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Demo Requests
            </CardTitle>
            <CardDescription>Try out the API tester with these sample requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {demoRequests.map((demo, index) => (
                <Button
                  key={index}
                  variant={selectedDemo === index ? "default" : "outline"}
                  onClick={() => loadDemoRequest(index)}
                  size="sm"
                >
                  {demo.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Request Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={requestConfig.method}
                onValueChange={(value) => setRequestConfig({ ...requestConfig, method: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter API URL"
                value={requestConfig.url}
                onChange={(e) => setRequestConfig({ ...requestConfig, url: e.target.value })}
                className="flex-1"
              />
            </div>

            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="params">Params</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className="space-y-2">
                <Label htmlFor="headers">Headers (key: value per line)</Label>
                <Textarea
                  id="headers"
                  placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  rows={4}
                />
              </TabsContent>
              <TabsContent value="params" className="space-y-2">
                <Label htmlFor="params">Query Parameters (key: value per line)</Label>
                <Textarea
                  id="params"
                  placeholder="page: 1&#10;limit: 10"
                  value={paramsText}
                  onChange={(e) => setParamsText(e.target.value)}
                  rows={4}
                />
              </TabsContent>
              <TabsContent value="body" className="space-y-2">
                <Label htmlFor="body">Request Body</Label>
                <Textarea
                  id="body"
                  placeholder="JSON, XML, or raw text"
                  value={requestConfig.body}
                  onChange={(e) => setRequestConfig({ ...requestConfig, body: e.target.value })}
                  rows={6}
                />
              </TabsContent>
            </Tabs>

            <Button onClick={handleSingleRequest} disabled={!requestConfig.url || loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Load Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pattern">Pattern</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requests">Total Requests</Label>
                    <Input
                      id="requests"
                      type="number"
                      value={loadTestConfig.requests}
                      onChange={(e) =>
                        setLoadTestConfig({
                          ...loadTestConfig,
                          requests: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={loadTestConfig.duration}
                      onChange={(e) =>
                        setLoadTestConfig({
                          ...loadTestConfig,
                          duration: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      max="3600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="concurrency">Max Concurrency</Label>
                  <Input
                    id="concurrency"
                    type="number"
                    value={loadTestConfig.concurrency}
                    onChange={(e) =>
                      setLoadTestConfig({
                        ...loadTestConfig,
                        concurrency: Number.parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    max="100"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pattern" className="space-y-4">
                <div>
                  <Label>Load Pattern</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {loadPatterns.map((pattern) => {
                      const Icon = pattern.icon
                      return (
                        <div
                          key={pattern.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            loadTestConfig.pattern === pattern.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setLoadTestConfig({ ...loadTestConfig, pattern: pattern.value as any })}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{pattern.label}</div>
                              <div className="text-sm text-muted-foreground">{pattern.description}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {loadTestConfig.pattern === "ramp-up" && (
                  <div>
                    <Label htmlFor="ramp-duration">Ramp Duration (seconds)</Label>
                    <Input
                      id="ramp-duration"
                      type="number"
                      value={loadTestConfig.rampDuration}
                      onChange={(e) =>
                        setLoadTestConfig({
                          ...loadTestConfig,
                          rampDuration: Number.parseInt(e.target.value) || 30,
                        })
                      }
                      min="1"
                      max="3600"
                    />
                  </div>
                )}

                {loadTestConfig.pattern === "burst" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="burst-size">Burst Size</Label>
                      <Input
                        id="burst-size"
                        type="number"
                        value={loadTestConfig.burstSize}
                        onChange={(e) =>
                          setLoadTestConfig({
                            ...loadTestConfig,
                            burstSize: Number.parseInt(e.target.value) || 20,
                          })
                        }
                        min="1"
                        max="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="burst-interval">Interval (seconds)</Label>
                      <Input
                        id="burst-interval"
                        type="number"
                        value={loadTestConfig.burstInterval}
                        onChange={(e) =>
                          setLoadTestConfig({
                            ...loadTestConfig,
                            burstInterval: Number.parseInt(e.target.value) || 5,
                          })
                        }
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>
                )}

                {loadTestConfig.pattern === "step" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="step-size">Step Size</Label>
                      <Input
                        id="step-size"
                        type="number"
                        value={loadTestConfig.stepSize}
                        onChange={(e) =>
                          setLoadTestConfig({
                            ...loadTestConfig,
                            stepSize: Number.parseInt(e.target.value) || 10,
                          })
                        }
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="step-duration">Step Duration (seconds)</Label>
                      <Input
                        id="step-duration"
                        type="number"
                        value={loadTestConfig.stepDuration}
                        onChange={(e) =>
                          setLoadTestConfig({
                            ...loadTestConfig,
                            stepDuration: Number.parseInt(e.target.value) || 10,
                          })
                        }
                        min="1"
                        max="300"
                      />
                    </div>
                  </div>
                )}

                {loadTestConfig.pattern === "custom" && (
                  <div>
                    <Label htmlFor="custom-sequence">Custom Sequence (comma-separated)</Label>
                    <Input
                      id="custom-sequence"
                      placeholder="10, 20, 30, 25, 15"
                      value={customSequenceText}
                      onChange={(e) => setCustomSequenceText(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Each number represents requests per interval</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="request-delay">Request Delay (ms)</Label>
                    <Input
                      id="request-delay"
                      type="number"
                      value={loadTestConfig.requestDelay}
                      onChange={(e) =>
                        setLoadTestConfig({
                          ...loadTestConfig,
                          requestDelay: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={loadTestConfig.timeout}
                      onChange={(e) =>
                        setLoadTestConfig({
                          ...loadTestConfig,
                          timeout: Number.parseInt(e.target.value) || 30,
                        })
                      }
                      min="1"
                      max="300"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="warmup">Warmup Requests</Label>
                  <Input
                    id="warmup"
                    type="number"
                    value={loadTestConfig.warmupRequests}
                    onChange={(e) =>
                      setLoadTestConfig({
                        ...loadTestConfig,
                        warmupRequests: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Requests to send before starting the actual test</p>
                </div>
                {loadTestConfig.chaosEnabled && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Chaos Engineering Configuration</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="network-failure-rate">Network Failure Rate (%)</Label>
                          <Input
                            id="network-failure-rate"
                            type="number"
                            value={loadTestConfig.networkFailureRate}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                networkFailureRate: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeout-failure-rate">Timeout Failure Rate (%)</Label>
                          <Input
                            id="timeout-failure-rate"
                            type="number"
                            value={loadTestConfig.timeoutFailureRate}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                timeoutFailureRate: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="slow-response-rate">Slow Response Rate (%)</Label>
                          <Input
                            id="slow-response-rate"
                            type="number"
                            value={loadTestConfig.slowResponseRate}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                slowResponseRate: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slow-response-delay">Slow Response Delay (ms)</Label>
                          <Input
                            id="slow-response-delay"
                            type="number"
                            value={loadTestConfig.slowResponseDelay}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                slowResponseDelay: Number.parseInt(e.target.value) || 2000,
                              })
                            }
                            min="100"
                            max="30000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="random-error-rate">Random Error Rate (%)</Label>
                          <Input
                            id="random-error-rate"
                            type="number"
                            value={loadTestConfig.randomErrorRate}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                randomErrorRate: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="network-jitter">Network Jitter (ms)</Label>
                          <Input
                            id="network-jitter"
                            type="number"
                            value={loadTestConfig.networkJitter}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                networkJitter: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="5000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="packet-loss-rate">Packet Loss Rate (%)</Label>
                          <Input
                            id="packet-loss-rate"
                            type="number"
                            value={loadTestConfig.packetLossRate}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                packetLossRate: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="50"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bandwidth-limit">Bandwidth Limit (KB/s)</Label>
                          <Input
                            id="bandwidth-limit"
                            type="number"
                            value={loadTestConfig.bandwidthLimit}
                            onChange={(e) =>
                              setLoadTestConfig({
                                ...loadTestConfig,
                                bandwidthLimit: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                            max="10000"
                          />
                          <p className="text-xs text-muted-foreground mt-1">0 = no limit</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="chaos-enabled"
                    checked={loadTestConfig.chaosEnabled}
                    onCheckedChange={(checked) => setLoadTestConfig({ ...loadTestConfig, chaosEnabled: checked })}
                  />
                  <Label htmlFor="chaos-enabled" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Enable Chaos Engineering
                  </Label>
                </div>
              </TabsContent>
            </Tabs>

            {selectedPattern && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <selectedPattern.icon className="h-4 w-4" />
                  <span className="font-medium">{selectedPattern.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPattern.description}</p>
              </div>
            )}

            {loadTesting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button
              onClick={handleLoadTest}
              disabled={!requestConfig.url || loadTesting}
              className="w-full"
              variant="secondary"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {loadTesting ? "Running Load Test..." : "Start Load Test"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {response && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Single Request Response</CardTitle>
            <div className="flex gap-2">
              {response.status && (
                <Badge variant={response.status < 400 ? "default" : "destructive"}>
                  {response.status} {response.statusText}
                </Badge>
              )}
              {response.responseTime && <Badge variant="outline">{response.responseTime}ms</Badge>}
              {response.size && <Badge variant="outline">{response.size} bytes</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {response.error ? (
              <div className="text-red-500 font-mono text-sm">Error: {response.error}</div>
            ) : (
              <Tabs defaultValue="body" className="w-full">
                <TabsList>
                  <TabsTrigger value="body">Response Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="headers">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {loadTestResults && analytics && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadTestResults.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  {loadTestResults.successfulRequests} successful, {loadTestResults.failedRequests} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadTestResults.averageResponseTime.toFixed(2)}ms</div>
                <p className="text-xs text-muted-foreground">σ = {analytics.standardDeviation.toFixed(2)}ms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadTestResults.requestsPerSecond.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">requests per second</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.errorRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  {loadTestResults.failedRequests} of {loadTestResults.totalRequests} requests
                </p>
              </CardContent>
            </Card>
            {loadTestResults.chaosMetrics && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chaos Events</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loadTestResults.chaosMetrics.totalChaosEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg impact: {loadTestResults.chaosMetrics.chaosImpactOnLatency.toFixed(2)}ms
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="latency" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="latency">Latency</TabsTrigger>
              <TabsTrigger value="throughput">Throughput</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
              <TabsTrigger value="chaos">Chaos</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="status">Status Codes</TabsTrigger>
              <TabsTrigger value="percentiles">Percentiles</TabsTrigger>
            </TabsList>

            <TabsContent value="latency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Over Time</CardTitle>
                  <CardDescription>Individual request latencies throughout the test</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={analytics.latencyOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        label={{ value: "Time (seconds)", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Response Time (ms)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}s`}
                        formatter={(value: any) => [`${value}ms`, "Response Time"]}
                      />
                      <Scatter dataKey="responseTime" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Response Time Trend</CardTitle>
                  <CardDescription>Moving average of response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.latencyOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        label={{ value: "Time (seconds)", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Response Time (ms)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}s`}
                        formatter={(value: any) => [`${value}ms`, "Response Time"]}
                      />
                      <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="throughput" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Throughput Over Time</CardTitle>
                  <CardDescription>Actual vs planned requests per second</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={analytics.throughputOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        label={{ value: "Time (seconds)", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Requests per Second", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}s`}
                        formatter={(value: any, name: string) => [
                          `${value}`,
                          name === "rps" ? "Actual RPS" : "Planned RPS",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="planned"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="rps"
                        stackId="2"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pattern" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Load Pattern Visualization</CardTitle>
                  <CardDescription>Planned load pattern for this test</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={loadTestResults.plannedPattern.map((p) => ({
                        time: p.time / 1000,
                        requests: p.requests,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        label={{ value: "Time (seconds)", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Planned Requests", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}s`}
                        formatter={(value: any) => [`${value}`, "Planned Requests"]}
                      />
                      <Line type="monotone" dataKey="requests" stroke="#ff7300" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pattern Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pattern Type:</span>
                        <span className="font-mono">{selectedPattern?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Duration:</span>
                        <span className="font-mono">{loadTestConfig.duration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Concurrency:</span>
                        <span className="font-mono">{loadTestConfig.concurrency}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {loadTestConfig.pattern === "ramp-up" && (
                        <div className="flex justify-between">
                          <span>Ramp Duration:</span>
                          <span className="font-mono">{loadTestConfig.rampDuration}s</span>
                        </div>
                      )}
                      {loadTestConfig.pattern === "burst" && (
                        <>
                          <div className="flex justify-between">
                            <span>Burst Size:</span>
                            <span className="font-mono">{loadTestConfig.burstSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Burst Interval:</span>
                            <span className="font-mono">{loadTestConfig.burstInterval}s</span>
                          </div>
                        </>
                      )}
                      {loadTestConfig.pattern === "step" && (
                        <>
                          <div className="flex justify-between">
                            <span>Step Size:</span>
                            <span className="font-mono">{loadTestConfig.stepSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Step Duration:</span>
                            <span className="font-mono">{loadTestConfig.stepDuration}s</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chaos" className="space-y-4">
              {analytics.chaosAnalytics ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Chaos Events by Type</CardTitle>
                      <CardDescription>Distribution of different chaos engineering events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics.chaosAnalytics.chaosEventsByType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {analytics.chaosAnalytics.chaosEventsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}`, "Events"]} />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-2">
                          {analytics.chaosAnalytics.chaosEventsByType.map((item, index) => (
                            <div key={item.type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-medium">{item.type}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{item.count}</div>
                                <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Chaos Impact Over Time</CardTitle>
                      <CardDescription>Number of chaos events and their latency impact</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={analytics.chaosAnalytics.chaosImpactOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="time"
                            label={{ value: "Time (seconds)", position: "insideBottom", offset: -10 }}
                          />
                          <YAxis yAxisId="left" label={{ value: "Chaos Events", angle: -90, position: "insideLeft" }} />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: "Avg Latency Impact (ms)", angle: 90, position: "insideRight" }}
                          />
                          <Tooltip
                            labelFormatter={(value) => `Time: ${value}s`}
                            formatter={(value: any, name: string) => [
                              name === "chaosEvents" ? `${value} events` : `${value.toFixed(2)}ms`,
                              name === "chaosEvents" ? "Chaos Events" : "Avg Latency Impact",
                            ]}
                          />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="chaosEvents"
                            stackId="1"
                            stroke="#ff7300"
                            fill="#ff7300"
                            fillOpacity={0.6}
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="avgLatencyImpact"
                            stackId="2"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Normal vs Chaos Latency Comparison</CardTitle>
                      <CardDescription>
                        Performance comparison between normal and chaos-affected requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.chaosAnalytics.normalVsChaosLatency}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis label={{ value: "Average Latency (ms)", angle: -90, position: "insideLeft" }} />
                          <Tooltip
                            formatter={(value: any, name: string) => [`${value.toFixed(2)}ms`, "Avg Latency"]}
                            labelFormatter={(value) => `${value.charAt(0).toUpperCase() + value.slice(1)} Requests`}
                          />
                          <Bar dataKey="avgLatency" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        {analytics.chaosAnalytics.normalVsChaosLatency.map((item) => (
                          <div key={item.type} className="text-center p-3 border rounded-lg">
                            <div className="font-medium capitalize">{item.type} Requests</div>
                            <div className="text-2xl font-bold">{item.avgLatency.toFixed(2)}ms</div>
                            <div className="text-muted-foreground">{item.count} requests</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {loadTestResults.chaosMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Chaos Engineering Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">Network Failures</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.networkFailures}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Timeout Failures</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.timeoutFailures}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Slow Responses</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.slowResponses}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Random Errors</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.randomErrors}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Jitter Events</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.jitterEvents}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Packet Loss</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.packetLossEvents}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Bandwidth Limits</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.bandwidthLimitEvents}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Total Chaos Events</div>
                            <div className="text-lg font-bold">{loadTestResults.chaosMetrics.totalChaosEvents}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Chaos Engineering Disabled</CardTitle>
                    <CardDescription>
                      Enable chaos engineering in the advanced configuration to see chaos analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Chaos engineering helps you test how your API handles real-world network conditions and
                        failures.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Distribution</CardTitle>
                  <CardDescription>Histogram of response time ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.responseTimeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="range"
                        label={{ value: "Response Time Range", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis label={{ value: "Number of Requests", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value: any) => [`${value}`, "Requests"]} />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status Code Distribution</CardTitle>
                  <CardDescription>Breakdown of HTTP status codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.statusCodeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.statusCodeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}`, "Requests"]} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2">
                      {analytics.statusCodeDistribution.map((item, index) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{item.status}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{item.count}</div>
                            <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="percentiles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Latency Percentiles</CardTitle>
                  <CardDescription>Statistical breakdown of response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.percentiles.p50.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">50th Percentile (Median)</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.percentiles.p90.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">90th Percentile</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analytics.percentiles.p95.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">95th Percentile</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{analytics.percentiles.p99.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">99th Percentile</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Min Response Time:</span>
                        <div className="text-lg font-bold">{loadTestResults.minResponseTime}ms</div>
                      </div>
                      <div>
                        <span className="font-medium">Max Response Time:</span>
                        <div className="text-lg font-bold">{loadTestResults.maxResponseTime}ms</div>
                      </div>
                      <div>
                        <span className="font-medium">Standard Deviation:</span>
                        <div className="text-lg font-bold">{analytics.standardDeviation.toFixed(2)}ms</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Duration:</span>
                        <span className="font-mono">{(loadTestResults.totalDuration / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average RPS:</span>
                        <span className="font-mono">{loadTestResults.requestsPerSecond.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Load Pattern:</span>
                        <span className="font-mono">{selectedPattern?.label}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-mono">
                          {((loadTestResults.successfulRequests / loadTestResults.totalRequests) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-mono">{analytics.errorRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Data Transferred:</span>
                        <span className="font-mono">
                          {(loadTestResults.results.reduce((sum, r) => sum + r.size, 0) / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
