import React from "react";
import { Image, Text, View, Page, StyleSheet } from "@react-pdf/renderer";
import "@/lib/pdf-fonts";
import { createTw } from "react-pdf-tailwind";
import { format } from "date-fns";
import { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        custom: "#bada55",
      },
    },
  },
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
  approvalDecision?: string;
  rejectionReason?: string;
  sampleReceiptName: string;
  projectName?: string;
  clientName?: string;
  email?: string;
  receiptDate?: string;
  sampleReceiptNumber?: string;
  revisionNumber?: string;
  personnel?: ALL_PERSONNEL_QUERY_RESULT[number];
}

function formatStatus(status?: string) {
  const value = (status || "").trim().toLowerCase();
  if (!value) return "—";
  if (value === "not-applicable") return "N/A";
  if (value === "unsatisfactory") return "Unsatisfactory";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusTone(status?: string): "positive" | "negative" | "muted" {
  const value = (status || "").trim().toLowerCase();
  if (["yes", "adequate", "satisfactory", "approve"].includes(value)) {
    return "positive";
  }
  if (["no", "inadequate", "unsatisfactory", "reject"].includes(value)) {
    return "negative";
  }
  return "muted";
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
    approvalDecision,
    rejectionReason,
    sampleReceiptName,
    projectName = "Sample Receipt Verification",
    clientName = "Client Name",
    receiptDate = new Date().toISOString(),
    sampleReceiptNumber = `SR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    revisionNumber = `R${new Date().getFullYear()}-00`,
    email = "info@getlab.co.ug",
    personnel,
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
    heading: {
      color: "#43AC33",
      fontWeight: 700,
      fontSize: 12,
      marginBottom: 5,
    },
    subHeading: {
      color: "black",
      fontSize: 9,
      fontWeight: 600,
      marginBottom: 5,
    },
    spaceBetweenNoAlign: {
      flexDirection: "row",
      justifyContent: "space-between",
      color: "#3E3E3E",
    },
    header: {
      flexDirection: "row",
      textAlign: "right",
      borderRadius: 10,
      justifyContent: "space-between",
      marginBottom: 10,
    },
    titleContainer: { flexDirection: "row", marginTop: 10 },
    addressTitle: { fontSize: 8, fontWeight: 400 },
    metaTitle: { fontSize: 9, fontWeight: 600 },
    metaDescription: { fontSize: 9, fontWeight: 400 },
    quotationDetail: {
      fontSize: 8,
      fontWeight: 400,
    },
    title: {
      fontSize: 20,
      fontWeight: 600,
    },
    card: {
      width: "48%",
      border: "1px solid #43AC33",
      backgroundColor: "#e1ebe3",
      padding: 15,
      borderRadius: 10,
      minHeight: 80,
    },
    theader: {
      marginTop: 5,
      fontSize: 7,
      fontWeight: 500,
      paddingTop: 4,
      paddingLeft: 5,
      paddingRight: 5,
      flex: 1,
      height: 20,
      backgroundColor: "#E1EBE3",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    theaderSmall: {
      marginTop: 5,
      fontSize: 7,
      fontWeight: 500,
      paddingTop: 4,
      paddingLeft: 5,
      paddingRight: 5,
      flex: 0.4,
      height: 20,
      backgroundColor: "#E1EBE3",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    theaderWide: {
      marginTop: 5,
      fontSize: 7,
      fontWeight: 500,
      paddingTop: 4,
      paddingLeft: 5,
      paddingRight: 5,
      flex: 2.5,
      height: 20,
      backgroundColor: "#E1EBE3",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbody: {
      fontSize: 8,
      fontWeight: 400,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbodySmall: {
      fontSize: 8,
      fontWeight: 400,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 0.4,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbodyWide: {
      fontSize: 8,
      fontWeight: 400,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 2.5,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    subsection: {
      fontSize: 9,
      textAlign: "center",
      paddingTop: 4,
      paddingLeft: 7,
      paddingBottom: 4,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      fontWeight: 600,
      fontFamily: "SpaceGrotesk",
      backgroundColor: "whitesmoke",
    },
    statusPositive: {
      fontSize: 8,
      fontWeight: 700,
      color: "#43AC33",
    },
    statusNegative: {
      fontSize: 8,
      fontWeight: 700,
      color: "#b45353",
    },
    statusMuted: {
      fontSize: 8,
      fontWeight: 500,
      color: "#3E3E3E",
    },
    pageNumber: {
      position: "absolute",
      fontSize: 10,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "grey",
    },
  });

  const statusStyle = (status?: string) => {
    const tone = statusTone(status);
    if (tone === "positive") return styles.statusPositive;
    if (tone === "negative") return styles.statusNegative;
    return styles.statusMuted;
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
        <Text style={styles.title}>SAMPLE RECEIPT</Text>
        <View style={tw("flex flex-row mt-9")}>
          <Text style={styles.metaTitle}>Revision No:</Text>
          <Text style={styles.metaDescription}> {revisionNumber}</Text>
        </View>
        <View style={tw("flex flex-row")}>
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
      </View>
    </View>
  );
  /* eslint-enable jsx-a11y/alt-text */

  const ClientAndProject = () => (
    <View style={[styles.spaceBetweenNoAlign, { marginBottom: 16 }]}>
      <View style={styles.card}>
        <Text style={{ ...styles.heading, marginBottom: 15 }}>Received from</Text>
        <Text style={styles.subHeading}>{clientName}</Text>
        <Text style={styles.addressTitle}>Email: {email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={{ ...styles.heading, marginBottom: 15 }}>For Project</Text>
        <Text style={styles.subHeading}>{projectName}</Text>
      </View>
    </View>
  );

  const Subsection = ({ text }: { text: string }) => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.subsection}>
        <Text>{text}</Text>
      </View>
    </View>
  );

  const TableHead = ({
    pointLabel,
  }: {
    pointLabel: string;
  }) => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 8 }}>
      <View style={styles.theaderSmall}>
        <Text>NO.</Text>
      </View>
      <View style={styles.theaderWide}>
        <Text>{pointLabel}</Text>
      </View>
      <View style={styles.theader}>
        <Text>STATUS</Text>
      </View>
      <View style={styles.theader}>
        <Text>COMMENTS</Text>
      </View>
    </View>
  );

  const TableRows = ({
    items,
  }: {
    items: Array<{
      id: number;
      label: string;
      status: string;
      comments: string;
      required?: boolean;
    }>;
  }) =>
    items.map((item) => (
      <View key={item.id} style={{ width: "100%", flexDirection: "row" }} wrap={false}>
        <View style={styles.tbodySmall}>
          <Text>{item.id}</Text>
        </View>
        <View style={styles.tbodyWide}>
          <Text>
            {item.label}
            {item.required ? " *" : ""}
          </Text>
        </View>
        <View style={styles.tbody}>
          <Text style={statusStyle(item.status)}>{formatStatus(item.status)}</Text>
        </View>
        <View style={styles.tbody}>
          <Text>{item.comments?.trim() ? item.comments : "—"}</Text>
        </View>
      </View>
    ));

  const OverallComments = () => (
    <View style={styles.titleContainer}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Overall status</Text>
          <Text style={statusStyle(overallStatus)}>
            {formatStatus(overallStatus)}
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Additional comments</Text>
          <Text style={[styles.quotationDetail, { flexWrap: "wrap" }]}>
            {comments?.trim() ? comments : "No additional comments provided"}
          </Text>
        </View>
      </View>
    </View>
  );

  const Acknowledgements = () => (
    <View style={[styles.titleContainer, { marginTop: 16 }]}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Client acknowledgement</Text>
          <Text style={[styles.quotationDetail, { marginBottom: 8 }]}>
            {clientAcknowledgement || "—"}
          </Text>
          <Text style={styles.quotationDetail}>
            Name: {clientSignature || "—"}
          </Text>
          <Text style={styles.quotationDetail}>
            Role: {clientRepresentative || "—"}
          </Text>
          <Text style={styles.quotationDetail}>
            Date: {format(new Date(receiptDate), "dd/MM/yyyy")}
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>GETLAB acknowledgement</Text>
          {approvalDecision ? (
            <Text style={styles.quotationDetail}>
              Decision:{" "}
              {approvalDecision === "approve" ? "Approved" : "Rejected"}
            </Text>
          ) : null}
          {approvalDecision === "reject" && rejectionReason ? (
            <Text style={styles.quotationDetail}>
              Rejection reason: {rejectionReason}
            </Text>
          ) : null}
          {approvalDecision === "approve" ? (
            <>
              <Text style={styles.quotationDetail}>
                Expected delivery date:{" "}
                {expectedDeliveryDate
                  ? format(new Date(expectedDeliveryDate), "dd/MM/yyyy")
                  : "Not specified"}
              </Text>
              <Text style={styles.quotationDetail}>
                Sample retention duration:{" "}
                {sampleRetentionDuration || "Not specified"}
              </Text>
            </>
          ) : null}
          {getlabAcknowledgement ? (
            <Text style={[styles.quotationDetail, { marginTop: 4 }]}>
              Notes: {getlabAcknowledgement}
            </Text>
          ) : null}
          <Text style={[styles.quotationDetail, { marginTop: 8 }]}>
            Name: {sampleReceiptName || "—"}
          </Text>
          <Text style={styles.quotationDetail}>
            Role: {personnel?.departmentRoles?.[0]?.role || "—"}
          </Text>
          <Text style={styles.quotationDetail}>
            Date: {format(new Date(receiptDate), "dd/MM/yyyy")}
          </Text>
        </View>
      </View>
    </View>
  );

  const Certifications = () => (
    <View style={styles.titleContainer}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Contact us</Text>
          <Text style={styles.quotationDetail}>
            If you have any questions concerning this sample receipt, contact
            GETLAB on +256 (0) 392 175 883 or email info@getlab.co.ug
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            style={tw("w-[200px] mt-5")}
            src="/getlab-certifications.png"
          />
        </View>
      </View>
    </View>
  );

  const PageNumber = () => (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  );

  return (
    <>
      <Page size="A4" style={styles.page}>
        <Header />
        <ClientAndProject />
        <TableHead pointLabel="POINTS REVIEWED" />
        <Subsection text="General checks for the samples delivered" />
        <TableRows items={reviewItems} />
        <PageNumber />
      </Page>
      <Page size="A4" style={styles.page}>
        <TableHead pointLabel="REQUIREMENTS" />
        <Subsection text="Adequacy checks for the samples delivered" />
        <TableRows items={adequacyChecks} />
        <OverallComments />
        <Acknowledgements />
        <Certifications />
        <PageNumber />
      </Page>
    </>
  );
};
