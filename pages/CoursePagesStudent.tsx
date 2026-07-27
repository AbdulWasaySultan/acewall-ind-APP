"use client"

import { useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    ScrollView,
    ActivityIndicator,
} from "react-native"
import { getStudentPages, getStudentCourses, } from "../services/course"
import SimpleIcon from "../components/SimpleIcon"
type StudentPage = {
    _id: string
    title: string
    description?: string
    type?: "lesson" | "chapter"
    image?: { url?: string | null } | null
    course?: { _id: string; courseTitle?: string }
    createdAt?: string
}
type CourseOption = { id: string; label: string }

type Props = {
    // If you can pass this via navigation params, great; otherwise falls back to provided example id
    studentId?: string
}

export default function CoursePagesStudent({ studentId = "68c341b51febd9a384b8b9f9" }: Props) {
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState<StudentPage[]>([])
    const [courses, setCourses] = useState<CourseOption[]>([])
    const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)

    const [previewOpen, setPreviewOpen] = useState(false)
    const [selectedPage, setSelectedPage] = useState<StudentPage | null>(null)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    setLoading(true)
                    const [pagesResp, coursesResp] = await Promise.all([getStudentPages(studentId), getStudentCourses()])

                    if (!mounted) return
                    setPages(pagesResp)

                    const options: CourseOption[] = [
                        { id: "all", label: "All Courses" },
                        ...coursesResp.map((c: any) => ({
                            id: c.course?._id,
                            label: c.course?.courseTitle || "Untitled Course",
                        })),
                    ]
                    setCourses(options)
                    setSelectedCourse(options[0]) // default: All Courses
                } catch (e) {
                    console.error("[v0] pages/courses fetch failed:", e)
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => {
            mounted = false
        }
    }, [studentId])

    const filteredPages = useMemo(() => {
        if (!selectedCourse || selectedCourse.id === "all") return pages
        return pages.filter((p) => p.course?._id === selectedCourse.id)
    }, [pages, selectedCourse])

    const onOpenPreview = (page: StudentPage) => {
        setSelectedPage(page)
        setPreviewOpen(true)
    }

    const onClosePreview = () => {
        setPreviewOpen(false)
        setSelectedPage(null)
    }

    const renderPageItem = ({ item }: { item: StudentPage }) => {
        const imageUrl = item.image?.url || undefined
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onOpenPreview(item)}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!!item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.cardImage} /> : null}
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Your Course Pages</Text>

            {/* Filter Select */}
            <TouchableOpacity
                onPress={() => setFilterOpen(true)}
                style={styles.selectTrigger}
                accessibilityRole="button"
                accessibilityLabel="Select course filter"
            >
                <Text style={styles.selectLabel}>{selectedCourse?.label || "All Courses"}</Text>
                <Text style={styles.selectChevron}>▾</Text>
            </TouchableOpacity>

            {/* Course Options Modal */}
            <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
                <View style={styles.overlay}>
                    <View style={styles.selectSheet}>
                        <View style={styles.selectHeader}>
                            <Text style={styles.selectTitle}>Filter by course</Text>
                            <TouchableOpacity onPress={() => setFilterOpen(false)} style={styles.closeBtn}>
                                <SimpleIcon name="close" size={20} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                        >
                            {courses.map((opt) => {
                                const active = selectedCourse?.id === opt.id
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        onPress={() => {
                                            setSelectedCourse(opt)
                                            setFilterOpen(false)
                                        }}
                                        style={[styles.optionRow, active && styles.optionRowActive]}
                                    >
                                        <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={1}>
                                            {opt.label}
                                        </Text>
                                        {active ? <Text style={styles.checkMark}>✓</Text> : null}
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#16a34a" />
                    <Text style={styles.loadingText}>Loading pages…</Text>
                </View>
            ) : filteredPages.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <SimpleIcon name="description" size={40} color="#9ca3af" />
                    <Text style={styles.emptyText}>No pages found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPageItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                />
            )}

            {/* Preview Modal (matches your screenshots) */}
            <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={onClosePreview}>
                <View style={styles.overlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>{selectedPage?.title}</Text>
                            <TouchableOpacity onPress={onClosePreview} style={styles.closeBtn} accessibilityRole="button">
                                <SimpleIcon name="close" size={22} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                        >
                            {selectedPage?.image?.url ? (
                                <Image source={{ uri: selectedPage.image.url }} style={styles.modalImage} />
                            ) : null}
                            {!!selectedPage?.description && <Text style={styles.modalDescription}>{selectedPage.description}</Text>}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const brand = {
    green: "#16a34a",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    card: "#ffffff",
    bg: "#f9fafb",
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: brand.bg,
    },
    heading: {
        fontSize: 22,
        fontWeight: "700",
        color: brand.text,
        marginBottom: 12,
    },

    // Select
    selectTrigger: {
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: brand.border,
        backgroundColor: brand.card,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    selectLabel: {
        color: brand.text,
        fontSize: 14,
        fontWeight: "500",
    },
    selectChevron: {
        color: brand.muted,
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    selectSheet: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: brand.card,
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    selectHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomColor: brand.border,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    selectTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: brand.text,
    },
    closeBtn: { padding: 8 },

    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 8,
    },
    optionRowActive: {
        backgroundColor: "#f0fdf4",
    },
    optionText: { flex: 1, color: brand.text, fontSize: 14 },
    optionTextActive: { color: brand.green, fontWeight: "600" },
    checkMark: { color: brand.green, fontSize: 16, marginLeft: 8 },

    // Cards list
    listContent: { paddingTop: 8, paddingBottom: 24 },
    card: {
        backgroundColor: brand.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: brand.border,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: brand.text,
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 14,
        color: brand.muted,
        marginBottom: 10,
    },
    cardImage: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
    },

    // Loading / Empty
    loadingWrap: { alignItems: "center", paddingTop: 40 },
    loadingText: { marginTop: 8, color: brand.muted },
    emptyWrap: { alignItems: "center", paddingTop: 40 },
    emptyText: { color: brand.muted },

    // Preview modal
    modalCard: {
        width: "100%",
        maxWidth: 900,
        backgroundColor: brand.card,
        borderRadius: 16,
        padding: 16,
    },
    modalHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    modalTitle: {
        flex: 1,
        color: brand.text,
        fontWeight: "700",
        fontSize: 20,
    },
    modalImage: {
        width: "100%",
        height: 420,
        borderRadius: 10,
        resizeMode: "cover",
        backgroundColor: "#f3f4f6",
    },
    modalDescription: {
        color: brand.muted,
        fontSize: 14,
        marginTop: 12,
    },
})
