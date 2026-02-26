"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaterialReader } from "@/components/crash-course/material-reader"
import { studyMaterials, type StudyMaterial, type Subject } from "@/data/study-materials"
import { motion } from "framer-motion"
import {
  Search,
  FileText,
  Calendar,
  Download,
  FunctionSquare,
  LineChart,
  Network,
  Percent,
  BarChart,
  BookOpenText,
  Monitor,
  Sigma,
  Type,
} from "lucide-react"

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredMaterials, setFilteredMaterials] = useState<Subject[]>(studyMaterials)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)
  const [isReaderOpen, setIsReaderOpen] = useState(false)

  // Get icon component based on subject icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "function-square":
        return <FunctionSquare className="h-5 w-5" />
      case "line-chart":
        return <LineChart className="h-5 w-5" />
      case "network":
        return <Network className="h-5 w-5" />
      case "percent":
        return <Percent className="h-5 w-5" />
      case "bar-chart":
        return <BarChart className="h-5 w-5" />
      case "previous-year":
      return <BookOpenText className="h-5 w-5" />
    case "computer":
      return <Monitor className="h-5 w-5" />
      case "Eng":
      return <Type className="h-5 w-5" />;
    case "maths":
      return <Sigma className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

const colorMap: { [key: string]: string } = {
  "Mathematics": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white",
  "Computer-Science": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white",
  "Quantitive Aptitude": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white",
  "Previous Year Questions": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white",
  "English": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white",
  "Mental Ability": "bg-[#e0f9fc] dark:bg-[#28cee3] text-black dark:text-white"
};


  // Filter materials based on search query and active tab
  useEffect(() => {
    if (searchQuery.trim() === "" && activeTab === "all") {
      setFilteredMaterials(studyMaterials)
      return
    }

    const query = searchQuery.toLowerCase().trim()

    let filtered = studyMaterials

    // Filter by tab if not "all"
    if (activeTab !== "all") {
      filtered = filtered.filter((subject) => subject.id === activeTab)
    }

    // Filter by search query
    if (query !== "") {
      filtered = filtered
        .map((subject) => {
          return {
            ...subject,
            materials: subject.materials.filter(
              (material) =>
                material.name.toLowerCase().includes(query) || material.description.toLowerCase().includes(query),
            ),
          }
        })
        .filter((subject) => subject.materials.length > 0)
    }

    setFilteredMaterials(filtered)
  }, [searchQuery, activeTab])

  const openMaterial = (material: StudyMaterial) => {
    setSelectedMaterial(material)
    setIsReaderOpen(true)
  }

  const closeMaterial = () => {
    setIsReaderOpen(false)
  }

  return (
    <div className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Study Materials</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Access all your course materials in one place</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search materials..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="whitespace-nowrap">All Subjects</TabsTrigger>
            {studyMaterials.map((subject) => (
              <TabsTrigger key={subject.id} value={subject.id} className="flex items-center gap-1 whitespace-nowrap">
                <span className="hidden sm:inline">{getIconComponent(subject.icon)}</span>
                <span className="text-xs sm:text-sm">{subject.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMaterials.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                className="h-full"
              >
                <Card className="h-[500px] sm:h-[550px] flex flex-col">
                  <CardHeader className={`${colorMap[subject.name]} rounded-t-lg flex-shrink-0`}>
                    <div className="flex items-center gap-2">
                      {getIconComponent(subject.icon)}
                      <CardTitle className="text-sm sm:text-base">{subject.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2">{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 scrollbar-hide hover:scrollbar-show relative">
                      <style jsx>{`
                        .scrollbar-hide {
                          scrollbar-width: none;
                          -ms-overflow-style: none;
                        }
                        .scrollbar-hide::-webkit-scrollbar {
                          display: none;
                        }
                        .scrollbar-hide:hover {
                          scrollbar-width: thin;
                          -ms-overflow-style: auto;
                        }
                        .scrollbar-hide:hover::-webkit-scrollbar {
                          display: block;
                          width: 6px;
                        }
                        .scrollbar-hide:hover::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        .scrollbar-hide:hover::-webkit-scrollbar-thumb {
                          background: rgba(156, 163, 175, 0.5);
                          border-radius: 3px;
                        }
                        .scrollbar-hide:hover::-webkit-scrollbar-thumb:hover {
                          background: rgba(156, 163, 175, 0.7);
                        }
                      `}</style>
                      {subject.materials.length > 0 ? (
                        subject.materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer flex-shrink-0"
                            onClick={() => openMaterial(material)}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-xs sm:text-sm truncate">{material.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {material.description}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                              {material.size}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4 text-sm">No materials found</p>
                      )}
                      {/* Scroll indicator */}
                      {subject.materials.length > 4 && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 sm:pt-4 flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {subject.materials.length} {subject.materials.length === 1 ? "material" : "materials"}
                    </p>
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={() => setActiveTab(subject.id)}>
                      View All
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {studyMaterials.map((subject) => (
          <TabsContent key={subject.id} value={subject.id} className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              <Card className="h-[600px] sm:h-[700px] lg:h-[800px] flex flex-col">
                <CardHeader className={`${colorMap[subject.name]}  flex-shrink-0`}>
                  <div className="flex items-center gap-2">
                    {getIconComponent(subject.icon)}
                    <CardTitle className="text-lg sm:text-xl">{subject.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base">{subject.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 scrollbar-hide hover:scrollbar-show relative">
                    <style jsx>{`
                      .scrollbar-hide {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                      }
                      .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                      }
                      .scrollbar-hide:hover {
                        scrollbar-width: thin;
                        -ms-overflow-style: auto;
                      }
                      .scrollbar-hide:hover::-webkit-scrollbar {
                        display: block;
                        width: 6px;
                      }
                      .scrollbar-hide:hover::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .scrollbar-hide:hover::-webkit-scrollbar-thumb {
                        background: rgba(156, 163, 175, 0.5);
                        border-radius: 3px;
                      }
                      .scrollbar-hide:hover::-webkit-scrollbar-thumb:hover {
                        background: rgba(156, 163, 175, 0.7);
                      }
                    `}</style>
                    {filteredMaterials
                      .find((s) => s.id === subject.id)
                      ?.materials.map((material, index) => (
                        <motion.div
                          key={material.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex-shrink-0"
                        >
                          <div
                            className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => openMaterial(material)}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className={`p-2 sm:p-3 rounded-lg ${subject.color} text-white flex-shrink-0`}>
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm sm:text-base truncate">{material.name}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">{material.description}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span className="hidden sm:inline">{material.dateAdded}</span>
                                    <span className="sm:hidden">{material.dateAdded.split('/')[0]}/{material.dateAdded.split('/')[1]}</span>
                                  </span>
                                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    {material.type.toUpperCase()}
                                  </span>
                                  {material.size && (
                                    <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                      <Download className="h-3 w-3" />
                                      {material.size}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="text-xs sm:text-sm flex-shrink-0 ml-2">
                              <span className="hidden sm:inline">View Material</span>
                              <span className="sm:hidden">View</span>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    {(!filteredMaterials.find((s) => s.id === subject.id) ||
                      filteredMaterials.find((s) => s.id === subject.id)?.materials.length === 0) && (
                      <p className="text-center text-muted-foreground py-8 text-sm">No materials found matching your search</p>
                    )}
                    {/* Scroll indicator for individual subject view */}
                    {(filteredMaterials.find((s) => s.id === subject.id)?.materials.length || 0) > 5 && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <MaterialReader material={selectedMaterial} isOpen={isReaderOpen} onClose={closeMaterial} />
    </div>
  )
}