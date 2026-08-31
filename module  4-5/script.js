const loggedInUser = "Admin User";


document.addEventListener(
    "DOMContentLoaded",
    function() {
        document.getElementById(
            "registeredBy"
        ).textContent = loggedInUser;
    }
);


function generateAssetId() {
    const number =
        Math.floor(
            100000 +
            Math.random() * 900000
        );
    return "AST-" + number;
}


function generateReceiptId() {
    const number =
        Math.floor(
            10000 +
            Math.random() * 90000
        );
    return "REC-" + number;
}


function generateBarcode(assetId) {
    return "BAR-" + assetId;
}


function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}


document
    .getElementById("assetForm")
    .addEventListener(
        "submit",
        function(event) {
            event.preventDefault();
            const assetId =
                generateAssetId();


            const receiptId =
                generateReceiptId();


            const barcode =
                generateBarcode(assetId);


            const dateTime =
                getCurrentDateTime();


            const approvalRequired =
                document.getElementById(
                    "approvalRequired"
                ).checked;


            let status;
            if (approvalRequired) {
                status = "Pending";
            } else {
                status = "Available";
            }


            document.getElementById(
                "assetCode"
            ).textContent = assetId;


            document.getElementById(
                "receiptId"
            ).textContent = receiptId;


            document.getElementById(
                "barcodeValue"
            ).textContent = barcode;


            document.getElementById(
                "createdAt"
            ).textContent = dateTime;


            document.getElementById(
                "updatedAt"
            ).textContent = dateTime;


            document.getElementById(
                "registeredBy"
            ).textContent = loggedInUser;


            const statusBox =
                document.getElementById(
                    "assetStatus"
                );


            if (status === "Available") {
                statusBox.innerHTML =
                    '<span class="status available">' +
                    'Available' +
                    '</span>';
            } else {
                statusBox.innerHTML =
                    '<span class="status pending">' +
                    'Pending Approval' +
                    '</span>';
            }


            document.getElementById(
                "successAssetId"
            ).textContent = assetId;


            document.getElementById(
                "successReceiptId"
            ).textContent = receiptId;


            document.getElementById(
                "successStatus"
            ).textContent = status;


            document.getElementById(
                "successRegisteredBy"
            ).textContent = loggedInUser;


            document.getElementById(
                "successMessage"
            ).style.display = "block";


            document.getElementById(
                "successMessage"
            ).scrollIntoView({
                behavior: "smooth"
            });


            const assetData = {
                assetId: assetId,
                receiptId: receiptId,
                receivingType:
                    document.getElementById(
                        "receivingType"
                    ).value,


                supplier:
                    document.getElementById(
                        "supplier"
                    ).value,


                invoiceNumber:
                    document.getElementById(
                        "invoiceNumber"
                    ).value,


                receiptDate:
                    document.getElementById(
                        "receiptDate"
                    ).value,


                quantity:
                    document.getElementById(
                        "quantity"
                    ).value,


                receivingRemarks:
                    document.getElementById(
                        "receivingRemarks"
                    ).value,


                assetName:
                    document.getElementById(
                        "assetName"
                    ).value,


                category:
                    document.getElementById(
                        "category"
                    ).value,


                manufacturer:
                    document.getElementById(
                        "manufacturer"
                    ).value,


                model:
                    document.getElementById(
                        "model"
                    ).value,


                serialNumber:
                    document.getElementById(
                        "serialNumber"
                    ).value,


                condition:
                    document.getElementById(
                        "condition"
                    ).value,


                purchaseDate:
                    document.getElementById(
                        "purchaseDate"
                    ).value,


                warrantyExpiry:
                    document.getElementById(
                        "warrantyExpiry"
                    ).value,


                purchaseCost:
                    document.getElementById(
                        "purchaseCost"
                    ).value,


                department:
                    document.getElementById(
                        "department"
                    ).value,


                initialLocation:
                    document.getElementById(
                        "initialLocation"
                    ).value,


                additionalRemarks:
                    document.getElementById(
                        "additionalRemarks"
                    ).value,
                status: status,
                barcodeValue: barcode,
                registeredBy: loggedInUser,
                createdAt: dateTime,
                updatedAt: dateTime


            };


            console.log(
                "Asset Registration Data:",
                assetData
            );
        }
    );


function resetForm() {
    document
        .getElementById("assetForm")
        .reset();


    document.getElementById(
        "assetCode"
    ).textContent =
        "Will be generated";


    document.getElementById(
        "receiptId"
    ).textContent =
        "Will be generated";


    document.getElementById(
        "barcodeValue"
    ).textContent =
        "Will be generated";


    document.getElementById(
        "createdAt"
    ).textContent =
        "Automatic";


    document.getElementById(
        "updatedAt"
    ).textContent =
        "Automatic";


    document.getElementById(
        "registeredBy"
    ).textContent =
        loggedInUser;


    document.getElementById(
        "assetStatus"
    ).innerHTML =
        '<span class="status pending">' +
        'Pending Registration' +
        '</span>';


    document.getElementById(
        "successMessage"
    ).style.display =
        "none";
}

