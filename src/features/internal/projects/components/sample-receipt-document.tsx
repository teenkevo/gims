import React from "react";
import { Image, Text, View, Page, StyleSheet, Font } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { format } from "date-fns";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        custom: "#bada55",
      },
    },
  },
});

// Register font
Font.register({
  family: "SpaceGrotesk",
  fonts: [
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Light.ttf",
      fontWeight: 300,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

interface ReviewItem {
  id: number;
  label: string;
  status: string;
  comments: string;
}

interface AdequacyCheck {
  id: number;
  label: string;
  required: boolean;
  status: string;
  comments: string;
}

interface SampleReceiptDocumentProps {
  reviewItems: ReviewItem[];
  adequacyChecks: AdequacyCheck[];
  overallStatus: string;
  comments: string;
  clientAcknowledgement: string;
  clientSignature: string;
  clientRepresentative: string;
  getlabAcknowledgement: string;
  expectedDeliveryDate: string;
  sampleRetentionDuration: string;
  sampleReceiptRole: string;
  sampleReceiptName: string;
  sampleReceiptSignature: string;
  projectName?: string;
  clientName?: string;
  email?: string;
  receiptDate?: string;
  sampleReceiptNumber?: string;
}

export const SampleReceiptDocument = (props: SampleReceiptDocumentProps) => {
  const {
    reviewItems,
    adequacyChecks,
    overallStatus,
    comments,
    clientAcknowledgement,
    clientSignature,
    clientRepresentative,
    getlabAcknowledgement,
    expectedDeliveryDate,
    sampleRetentionDuration,
    sampleReceiptRole,
    sampleReceiptName,
    sampleReceiptSignature,
    projectName = "Sample Receipt Verification",
    clientName = "Client Name",
    receiptDate = new Date().toISOString(),
    sampleReceiptNumber = `SR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    email = "info@getlab.co.ug",
  } = props;

  const styles = StyleSheet.create({
    page: {
      fontSize: 11,
      paddingTop: 30,
      paddingBottom: 65,
      paddingHorizontal: 35,
      lineHeight: 1.2,
      flexDirection: "column",
      fontFamily: "SpaceGrotesk",
    },
    header: {
      flexDirection: "row",
      textAlign: "right",
      borderRadius: 10,
      justifyContent: "space-between",
      marginBottom: 10,
    },
    headerLeft: {
      width: "50%",
      flexDirection: "column",
    },
    headerRight: {
      width: "45%",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    logo: { width: 150, marginBottom: 20 },
    subHeading: {
      color: "black",
      fontSize: 9,
      fontWeight: 600,
      marginBottom: 5,
    },
    addressTitle: { fontSize: 8, fontWeight: 400 },
    metaTitle: { fontSize: 9, fontWeight: 600 },
    metaDescription: { fontSize: 9, fontWeight: 400 },
    title: {
      fontSize: 20,
      fontWeight: 600,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: "#000000",
      marginBottom: 10,
      backgroundColor: "#F5F5F5",
      padding: 8,
      borderLeft: "4 solid #000000",
    },
    table: {
      width: "100%",
      border: "1 solid #000000",
      marginBottom: 15,
    },
    tableHeader: {
      backgroundColor: "#F0F0F0",
      flexDirection: "row",
      borderBottom: "1 solid #000000",
    },
    tableHeaderCell: {
      padding: 8,
      fontSize: 9,
      fontWeight: 700,
      borderRight: "1 solid #000000",
      flex: 1,
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1 solid #CCCCCC",
    },
    tableCell: {
      padding: 6,
      fontSize: 8,
      borderRight: "1 solid #CCCCCC",
      flex: 1,
    },
    statusBadge: {
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: 4,
      paddingRight: 4,
      borderRadius: 3,
      fontSize: 7,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 2,
    },
    statusYes: {
      backgroundColor: "#D4EDDA",
      color: "#155724",
    },
    statusNo: {
      backgroundColor: "#F8D7DA",
      color: "#721C24",
    },
    statusNotApplicable: {
      backgroundColor: "#E2E3E5",
      color: "#383D41",
    },
    statusAdequate: {
      backgroundColor: "#D4EDDA",
      color: "#155724",
    },
    statusInadequate: {
      backgroundColor: "#F8D7DA",
      color: "#721C24",
    },
    statusSatisfactory: {
      backgroundColor: "#D4EDDA",
      color: "#155724",
    },
    statusUnsatisfactory: {
      backgroundColor: "#F8D7DA",
      color: "#721C24",
    },
    text: {
      fontSize: 9,
      lineHeight: 1.4,
      marginBottom: 5,
    },
    bold: {
      fontWeight: 700,
    },
    italic: {
      fontStyle: "italic",
    },
    signatureSection: {
      marginTop: 30,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    signatureBox: {
      width: "45%",
      borderTop: "1 solid #000000",
      paddingTop: 10,
    },
    signatureLabel: {
      fontSize: 9,
      fontWeight: 500,
      marginBottom: 5,
    },
    signatureValue: {
      fontSize: 9,
      marginBottom: 3,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 30,
      right: 30,
      textAlign: "center",
      fontSize: 8,
      color: "#666666",
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "yes":
        return [styles.statusBadge, styles.statusYes];
      case "no":
        return [styles.statusBadge, styles.statusNo];
      case "not-applicable":
        return [styles.statusBadge, styles.statusNotApplicable];
      case "adequate":
        return [styles.statusBadge, styles.statusAdequate];
      case "inadequate":
        return [styles.statusBadge, styles.statusInadequate];
      case "satisfactory":
        return [styles.statusBadge, styles.statusSatisfactory];
      case "unsatisfactory":
        return [styles.statusBadge, styles.statusUnsatisfactory];
      default:
        return [styles.statusBadge];
    }
  };

  /* eslint-disable jsx-a11y/alt-text */
  const Header = () => (
    <View style={styles.header}>
      <View>
        <Image style={tw("w-32 mb-4")} src="/getlab-logo.png" />
        <Text style={styles.subHeading}>
          Geotechnical Engineering and Technology Laboratory (GETLAB) Limited
        </Text>
        <Text style={styles.addressTitle}>
          Plot 1234, Block 197, Namirembe Hillside Road Kitetika Cell,
        </Text>
        <Text style={styles.addressTitle}>
          Kasangati Town Council, Wakiso, Uganda
        </Text>
        <Text style={styles.addressTitle}>Tel: +256 (0) 392 175 883</Text>
        <Text style={styles.addressTitle}>
          Email: info@getlab.co.ug Web: www.getlab.co.ug
        </Text>
        <Text style={{ ...styles.subHeading, fontSize: 8, marginTop: 5 }}>
          TIN Number: 1006958253
        </Text>
      </View>
      <View>
        <Text style={[styles.title]}>SAMPLE RECEIPT</Text>
        <View style={tw("flex flex-row mt-9")}>
          <Text style={styles.metaTitle}>Sample Receipt No:</Text>
          <Text style={styles.metaDescription}> {sampleReceiptNumber}</Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>Receipt Date:</Text>
          <Text style={styles.metaDescription}>
            {" "}
            {format(new Date(receiptDate), "MMM d, yyyy, h:mma")}
          </Text>
        </View>
        {/* <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>Project:</Text>
          <Text style={styles.metaDescription}> {projectName}</Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>Client:</Text>
          <Text style={styles.metaDescription}> {clientName}</Text>
        </View> */}
      </View>
    </View>
  );

  return (
    <Page size="A4" style={styles.page}>
      <Header />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROJECT INFORMATION</Text>
        <View style={tw("gap-1")}>
          <View style={tw("flex flex-row")}>
            <Text style={styles.metaTitle}>Project:</Text>
            <Text style={styles.metaDescription}> {projectName}</Text>
          </View>
          <View style={tw("flex flex-row")}>
            <Text style={styles.metaTitle}>Client:</Text>
            <Text style={styles.metaDescription}> {clientName}</Text>
          </View>
          <View style={tw("flex flex-row")}>
            <Text style={styles.metaTitle}>Email:</Text>
            <Text style={styles.metaDescription}> {email}</Text>
          </View>
        </View>
      </View>

      {/* General Checks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GENERAL CHECKS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Sr. No.</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
              Points Reviewed
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>
              Comments
            </Text>
          </View>
          {reviewItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.id}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.label}</Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={getStatusStyle(item.status)}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {item.comments || "-"}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Adequacy Checks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ADEQUACY CHECKS FOR THE SAMPLE DELIVERED
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>No.</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
              Requirements
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>
              Comments
            </Text>
          </View>
          {adequacyChecks.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.id}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {item.label}
                {item.required && " *"}
              </Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={getStatusStyle(item.status)}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {item.comments || "-"}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Overall Comments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          OVERALL COMMENTS ON SAMPLE DELIVERED
        </Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Status: </Text>
            <Text style={getStatusStyle(overallStatus)}>
              {overallStatus.toUpperCase()}
            </Text>
          </Text>
        </View>
        {comments && (
          <View>
            <Text style={styles.bold}>Additional Comments:</Text>
            <Text style={styles.text}>{comments}</Text>
          </View>
        )}
      </View>

      {/* Client's Acknowledgement Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CLIENT'S ACKNOWLEDGEMENT</Text>
        <Text style={styles.text}>{clientAcknowledgement}</Text>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Signature of Customer: </Text>
            {clientSignature}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Representative: </Text>
            {clientRepresentative}
          </Text>
        </View>
      </View>

      {/* GETLAB's Acknowledgement Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GETLAB'S ACKNOWLEDGEMENT</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Expected delivery date: </Text>
          {expectedDeliveryDate
            ? format(new Date(expectedDeliveryDate), "dd/MM/yyyy")
            : "Not specified"}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Sample retention duration: </Text>
          {sampleRetentionDuration || "Not specified"}
        </Text>
        {getlabAcknowledgement && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.bold}>Additional Notes:</Text>
            <Text style={styles.text}>{getlabAcknowledgement}</Text>
          </View>
        )}
      </View>

      {/* Sample Receipt Personnel Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SAMPLE RECEIPT PERSONNEL</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Role: </Text>
          {sampleReceiptRole}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Name: </Text>
          {sampleReceiptName}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Signature: </Text>
          {sampleReceiptSignature}
        </Text>
      </View>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>Client Representative</Text>
          <Text style={styles.signatureValue}>Name: {clientSignature}</Text>
          <Text style={styles.signatureValue}>
            Role: {clientRepresentative}
          </Text>
          <Text style={styles.signatureValue}>
            Date: {format(new Date(receiptDate), "dd/MM/yyyy")}
          </Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>GETLAB Personnel</Text>
          <Text style={styles.signatureValue}>Name: {sampleReceiptName}</Text>
          <Text style={styles.signatureValue}>Role: {sampleReceiptRole}</Text>
          <Text style={styles.signatureValue}>
            Date: {format(new Date(receiptDate), "dd/MM/yyyy")}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        This document was generated on {format(new Date(), "dd/MM/yyyy HH:mm")}{" "}
        | GETLAB Environmental Testing Services
      </Text>
    </Page>
  );
};
