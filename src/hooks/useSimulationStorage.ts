import type { SimulationFormData, SimulationRecord } from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

const readStoredData = (): SimulationRecord[] => {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
  return storage ? (JSON.parse(storage) as SimulationRecord[]) : []
}

const writeStoredData = (data: SimulationRecord[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = { ...formData, id }
    const savedData = readStoredData()

    writeStoredData([...savedData, record])
    return id
  }

  const getFormData = (id: string): SimulationRecord | null => {
    const savedData = readStoredData()
    return savedData.find((record) => record.id === id) || null
  }

  const getAllFormData = (): SimulationRecord[] => {
    return [...readStoredData()].reverse()
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const savedData = readStoredData()
    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record
    )
    writeStoredData(updated)
  }

  const saveChatHistory = (id: string, chatHistory: SimulationRecord['chatHistory']) => {
    const savedData = readStoredData()
    const updated = savedData.map((record) =>
      record.id === id ? { ...record, chatHistory } : record
    )
    writeStoredData(updated)
  }

  const deleteSimulation = (id: string) => {
    const savedData = readStoredData()
    const filtered = savedData.filter((record) => record.id !== id)
    writeStoredData(filtered)
  }

  return {
    saveFormData,
    getFormData,
    getAllFormData,
    updateSimulation,
    deleteSimulation,
    saveChatHistory,
  }
}