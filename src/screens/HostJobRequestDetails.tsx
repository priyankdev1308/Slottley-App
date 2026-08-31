import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "../../assets/icons";
import { fontSize, hp, wp } from "../helpers/responsive";
import { HostJobRequestDetailsScreenProps } from "../interface/screenTypes";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";
import { headerShadow } from "../utils/shadows";

// Mock data — replace with the selected job request once the host jobs API is wired.
const REQUEST = {
    job: {
        title: "Hair Apprentice",
        company: "The Cutting Room",
        location: "London — Shoreditch",
        schedule: "Full Time",
        date: "15/12/2026",
    },
    applicant: {
        id: "kenzi-lawson",
        name: "kenzi lawson",
        role: "Hair Apprentice",
        experience: "1.5 Years Exp.",
        about:
            "A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals. Modern setup with premium amenities in a prime location.",
        cvName: "Brand - Guidelines.PDF",
    },
};

const MetaItem = ({ icon, label }: { icon: number; label: string }) => (
    <View style={styles.metaItem}>
        <Image source={icon} resizeMode="contain" style={styles.metaIcon} />
        <Text numberOfLines={1} style={styles.metaText}>
            {label}
        </Text>
    </View>
);

const HostJobRequestDetails = ({
    navigation,
}: HostJobRequestDetailsScreenProps) => {
    const openChat = () => {
        navigation.navigate("ChatDetailScreen", {
            contactId: REQUEST.applicant.id,
            name: REQUEST.applicant.name,
        });
    };

    const updateRequest = (status: "Shortlist" | "Reject") => {
        Alert.alert(
            `${status} applicant`,
            `${REQUEST.applicant.name} has been ${status === "Shortlist" ? "shortlisted" : "rejected"
            }.`
        );
    };

    return (
        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View style={styles.headerShadowStrip} />
                <TouchableOpacity
                    activeOpacity={0.8}
                    accessibilityLabel="Go back"
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        resizeMode="contain"
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Requests Detail</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.jobCard}>
                    <Text style={styles.jobTitle}>{REQUEST.job.title}</Text>
                    <Text style={styles.company}>{REQUEST.job.company}</Text>
                    <View style={styles.jobMetaRow}>
                        <MetaItem icon={icons.mapPin} label={REQUEST.job.location} />
                        <MetaItem icon={icons.clock} label={REQUEST.job.schedule} />
                        <MetaItem icon={icons.calendar} label={REQUEST.job.date} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Applicant</Text>
                <View style={styles.applicantCard}>
                    <View style={styles.applicantHeader}>
                        <View style={styles.avatar}>
                            <Image
                                source={icons.tabProfile}
                                resizeMode="contain"
                                style={styles.avatarIcon}
                            />
                        </View>
                        <View style={styles.nameBlock}>
                            <Text style={styles.applicantName}>{REQUEST.applicant.name}</Text>
                            <Text style={styles.applicantRole}>{REQUEST.applicant.role}</Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            accessibilityLabel="Message applicant"
                            style={styles.chatButton}
                            onPress={openChat}
                        >
                            <Image
                                source={icons.chat}
                                resizeMode="contain"
                                style={styles.chatIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cardDivider} />
                    <View style={styles.applicantMetaRow}>
                        <MetaItem icon={icons.mapPin} label={REQUEST.job.location} />
                        <MetaItem icon={icons.clock} label={REQUEST.job.schedule} />
                        <MetaItem icon={icons.calendar} label={REQUEST.job.date} />
                    </View>
                    <View style={styles.experienceRow}>
                        <View style={styles.experienceIcon}>
                            <Image
                                source={icons.qualified}
                                resizeMode="contain"
                                style={styles.experienceIconImage}
                            />
                        </View>
                        <Text style={styles.metaText}>{REQUEST.applicant.experience}</Text>
                    </View>

                    <View style={styles.cardDivider} />
                    <View style={styles.aboutBlock}>
                        <Text style={styles.aboutTitle}>About Applicant</Text>
                        <Text style={styles.aboutText}>{REQUEST.applicant.about}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Attachments CV</Text>
                <TouchableOpacity activeOpacity={0.8} style={styles.attachmentCard}>
                    <View style={styles.pdfIcon}>
                        <Text style={styles.pdfFold}>▰</Text>
                        <Text style={styles.pdfText}>PDF</Text>
                    </View>
                    <View>
                        <Text style={styles.fileName}>{REQUEST.applicant.cvName}</Text>
                        <Text style={styles.fileType}>PDF</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.actionButton, styles.shortlistButton]}
                    onPress={() => updateRequest("Shortlist")}
                >
                    <Text style={styles.shortlistText}>Shortlist</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => updateRequest("Reject")}
                >
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default HostJobRequestDetails;

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.screenBgColor },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: wp(20),
        paddingVertical: hp(18),
        backgroundColor: colors.screenBgColor,
        height: hp(64),
        position: 'relative',
    },
    headerShadowStrip: {
        position: 'absolute',
        bottom: -8,          // sits just below the header
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: colors.screenBgColor,
        ...headerShadow,
    },
    backButton: { width: wp(32), height: wp(32), justifyContent: "center" },
    backIcon: { width: wp(32), height: wp(32), tintColor: colors.primary },
    headerTitle: {
        color: colors.black,
        fontSize: fontSize(20),
        fontFamily: fonts.Lato600,
    },
    scrollContent: {
        paddingHorizontal: wp(20),
        paddingTop: hp(24),
        paddingBottom: hp(28),
    },
    jobCard: {
        padding: wp(16),
        borderRadius: wp(12),
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
    },
    jobTitle: {
        color: colors.darkGray232323,
        fontSize: fontSize(16),
        fontFamily: fonts.Lato700,
    },
    company: {
        marginTop: hp(7),
        color: colors.darkGray,
        fontSize: fontSize(12),
        fontFamily: fonts.Lato500,
    },
    jobMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: hp(18),
        rowGap: hp(10),
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: wp(17),
        maxWidth: "48%",
    },
    metaIcon: {
        width: wp(14),
        height: wp(14),
        tintColor: colors.primary,
        marginRight: wp(7),
    },
    metaText: {
        color: colors.gray6E6E6E,
        fontSize: fontSize(12),
        fontFamily: fonts.Lato500,
    },
    sectionTitle: {
        marginTop: hp(24),
        marginBottom: hp(12),
        color: colors.black,
        fontSize: fontSize(14),
        fontFamily: fonts.Lato600,
    },
    applicantCard: {
        borderRadius: wp(12),
        borderWidth: 1,
        borderColor: colors.lightWhite,
        backgroundColor: colors.white,
        overflow: "hidden",
    },
    applicantHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(14),
        paddingVertical: hp(14),
    },
    avatar: {
        width: wp(45),
        height: wp(45),
        borderRadius: wp(25),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.sage,
        overflow: "hidden",
    },
    avatarIcon: { width: wp(27), height: wp(27), tintColor: colors.primary },
    nameBlock: { flex: 1, marginLeft: wp(12) },
    applicantName: {
        color: colors.black,
        fontSize: fontSize(17),
        fontFamily: fonts.Lato600,
    },
    applicantRole: {
        marginTop: hp(4),
        color: colors.gray6E6E6E,
        fontSize: fontSize(15),
        fontFamily: fonts.Lato400,
    },
    chatButton: {
        width: wp(30),
        height: wp(30),
        justifyContent: "center",
        alignItems: "center",
    },
    chatIcon: { width: wp(25), height: wp(25) },
    cardDivider: { height: 1, backgroundColor: colors.lightWhite },
    applicantMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: wp(14),
        paddingTop: hp(18),
        rowGap: hp(12),
    },
    experienceRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(14),
        paddingTop: hp(15),
        paddingBottom: hp(20),
    },
    experienceIcon: {
        width: wp(19),
        height: wp(19),
        borderRadius: wp(3),
        alignItems: "center",
        justifyContent: "center",
        marginRight: wp(8),
    },
    experienceIconImage: {
        width: wp(16),
        height: wp(16),
        tintColor: colors.primary,
    },
    aboutBlock: {
        paddingHorizontal: wp(18),
        paddingTop: hp(17),
        paddingBottom: hp(20),
    },
    aboutTitle: {
        color: colors.primary,
        fontSize: fontSize(12),
        fontFamily: fonts.Lato700,
    },
    aboutText: {
        marginTop: hp(10),
        color: colors.darkGray,
        fontSize: fontSize(12),
        lineHeight: fontSize(20),
        fontFamily: fonts.Lato400,
    },
    attachmentCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(12),
        borderWidth: 1,
        borderColor: colors.lightWhite,
        borderRadius: wp(12),
        backgroundColor: colors.white,
    },
    pdfIcon: {
        width: wp(58),
        height: wp(58),
        borderRadius: wp(12),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.E7F5FD,
        marginRight: wp(13),
    },
    pdfFold: {
        position: "absolute",
        top: hp(10),
        color: "#1585B8",
        fontSize: fontSize(20),
    },
    pdfText: {
        marginTop: hp(10),
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        color: colors.white,
        fontSize: fontSize(9),
        fontFamily: fonts.Lato700,
        backgroundColor: "#1585B8",
    },
    fileName: {
        color: colors.darkGray232323,
        fontSize: fontSize(14),
        fontFamily: fonts.Lato700,
    },
    fileType: {
        marginTop: hp(6),
        color: colors.subText,
        fontSize: fontSize(12),
        fontFamily: fonts.Lato600,
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: wp(20),
        paddingTop: hp(12),
        paddingBottom: hp(10),
        columnGap: wp(10),
        backgroundColor: colors.screenBgColor,
    },
    actionButton: {
        flex: 1,
        height: hp(54),
        borderRadius: wp(28),
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    shortlistButton: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    rejectButton: { borderColor: "#FFB8B8", backgroundColor: "#FFE8E8" },
    shortlistText: {
        color: colors.primary,
        fontSize: fontSize(16),
        fontFamily: fonts.Lato700,
    },
    rejectText: {
        color: "#FF3B3B",
        fontSize: fontSize(16),
        fontFamily: fonts.Lato700,
    },
});
