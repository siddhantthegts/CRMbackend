import express, { urlencoded } from 'express';
import { fileURLToPath } from 'url';
import path, { dirname, sep } from 'path';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import fs, { createWriteStream } from 'fs';
import doc from 'pdfkit';
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;

const client =
  'mongodb+srv://siddhantsingh:QPOj2XCyZlnzWxzx@cluster0crm.aqwihho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0CRM';
const cfg = {
  port: process.env.PORT || 9000,
};

const app = express();

app.use(compression());
var whitelist = ['http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const { Schema } = mongoose;

const contractors = new Schema({
  contractorName: String,
});

const projects = new Schema({
  code: String,
  name: String,
  address: String,
  dateofwork: String,
  description: String,
  assignedProjectManager: Array,
});
const user = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
  },
  phoneNumber: String,
  employeeType: String,
  compnayName: String,
  address: String,
  phone: String,
  email: String,
  salary: String,
  // dob: Date,
  gender: String,
  date: { type: Date, default: Date.now },
  emergencyContact: Array,
  companyAddress: [
    {
      address1: String,
      address2: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
    },
  ],
  employeeCertification: Array,
  employee: [
    {
      employeeCertification: [
        {
          certificationTitle: String,
          issuanceDate: Date,
          expirationDate: Date,
          ceritificate: String,
        },
      ],
    },
  ],
});

const employeeRecord = new Schema({
  hoursWorked: String,
  date: Date,
  total: String,
  employeeName: String,
  category: String,
  salary: String,
});

const trade = new Schema({
  trade: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const classification = new Schema({
  unionAffiliation: {
    default: 'NA',
    type: String,
  },
  classificationType: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const wage = new Schema({
  trade: String,
  fromDate: Date,
  toDate: Date,
  regularTime: String,
  shiftTime: String,
  overTime: String,
  doubleTime: String,
  classificationType: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

app.all('/', (req, res, next) => {
  // mongoose.connect(client);
  // const Cat = mongoose.model('Cat', { name: String });
  // const kitty = new Cat({ name: 'Zildjian' });
  // kitty.save().then(() => console.log('meow'));
  if (req.method === 'GET' || req.method === 'POST') {
    res.json(req.body.firstName);
  } else {
    next();
  }
});

app.get('/generateInvoice', (req, res) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const receivedQueryString = url.searchParams.get('orderData');
  const receivedIds = JSON.parse(receivedQueryString);
  console.log(receivedIds);
  let orderInfo = {
    orderNo: '15484659',
    invoiceNo: 'MH-MU-1077',
    invoiceDate: '11/05/2021',
    invoiceTime: '10:57:00 PM',
    products: receivedIds,
    totalValue: 45997,
  };
  mongoose.connect(client);
  let fontNormal = 'Helvetica';
  let fontBold = 'Helvetica-Bold';
  // if (req.query.employee != null || req.query.employee != '') {
  const doc = new PDFDocument({ size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="' + req.query.customerName + '_invoice.pdf"'
  );
  doc.pipe(res);
  // doc.pipe(fs.createWriteStream('./files/invoice.pdf'));
  doc.image('./img/logo.png', 25, 20, { width: 100, height: 40 });
  doc.font(fontNormal).text('KHALSA MOVERS PTY LTD', 7, 65);
  doc.fontSize(6).font(fontNormal).text('ABN : 98 657 376 415', 7, 80);
  doc
    .font(fontNormal)
    .fontSize(14)
    .text('Order Invoice/Bill Receipt', 400, 30, { width: 200 });
  doc.fontSize(10).text(req.query.date, 400, 46, { width: 200 });

  doc.font(fontBold).text('Built to:', 7, 100);
  doc.font(fontNormal).text(req.query.customerName, 7, 115, { width: 250 });
  doc.text('Address of client 209721, Uttar Pradhesh India', 7, 130, {
    width: 150,
    height: 250,
  });

  doc.font(fontBold).text('Ship to:', 400, 100);
  doc.font(fontNormal).text(req.query.customerName, 400, 115, { width: 250 });
  doc.text(
    'Info Address of client Uttar Pradesh' + ' ' + '209721 India ',
    400,
    130,
    { width: 150, height: 250 }
  );

  doc.text('Invoice No:', 7, 210, { width: 250 });
  doc.text('Due Date: ' + req.query.date, 7, 225, { width: 250 });

  doc.rect(7, 250, 560, 20).fill('#FC427B').stroke('#FC427B');
  doc.fillColor('#fff').text('Date', 20, 256, { width: 90 });
  doc.text('Employee Name', 110, 256, { width: 190 });
  doc.text('Total Hours', 300, 256, { width: 100 });
  doc.text('Price', 400, 256, { width: 100 });
  doc.text('Total Price', 500, 256, { width: 100 });

  let productNo = 1;
  orderInfo.products.forEach((element) => {
    console.log('adding', element.name);
    let y = 256 + productNo * 20;
    doc.fillColor('#000').text(element.date.slice(0, 10), 20, y, { width: 90 });
    doc.text(element.employeeName, 110, y, { width: 190 });
    doc.text(element.hoursWorked, 300, y, { width: 100 });
    doc.text(element.salary, 400, y, { width: 100 });
    doc.text(element.total, 500, y, { width: 100 });
    productNo++;
  });

  doc
    .rect(7, 256 + productNo * 20, 560, 0.2)
    .fillColor('#000')
    .stroke('#000');
  productNo++;
  doc.font(fontBold).text('GST:', 400, 256 + productNo * 17 + 10);
  doc.font(fontBold).text('Tax:', 400, 256 + productNo * 17 + 25);
  doc.font(fontBold).text('Total:', 400, 256 + productNo * 17 + 40);
  doc.font(fontBold).text(orderInfo.totalValue, 500, 256 + productNo * 17 + 40);
  doc.image('./img/invoicebottom.png', 10, 720, { width: 323, height: 120 });

  doc.end();
});

app.get('/download', (req, res) => {
  let filepath = path.join(
    __dirname + './payslips/' + 'employee' + '_payslip.pdf'
  );
  res.download(filepath);
});

app.all('/generatePayslip', (req, res) => {
  if (req.method === 'GET') {
    mongoose.connect(client);
    // if (
    //   req.body.employee != null ||
    //   req.body.dateofwork != null ||
    //   req.body.hoursWorked != null ||
    //   req.body.total != null
    // ) {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + req.body.employee + '_payslip.pdf"'
    );
    console.log(req.query.employee + req.query.dateofwork);

    doc.pipe(res);
    // doc.pipe(
    //   fs.createWriteStream('./payslips/' + req.body.employee + '_payslip.pdf')
    // );
    doc
      .image('img/logo.png', 170, 60, { fit: [80, 80] })
      .font('Times-Roman')
      .fontSize(20)
      .text('PAY SLIP', 380, 70)
      .moveDown(0.5)
      .moveTo(140, 110)
      .lineTo(490, 110)
      .stroke('#808080')
      .moveTo(140, 111)
      .lineTo(490, 111)
      .stroke('#808080')
      .moveTo(140, 112)
      .lineTo(490, 112)
      .stroke('#808080')
      .moveTo(140, 113)
      .lineTo(490, 113)
      .stroke('#808080')
      .moveTo(140, 114)
      .lineTo(490, 114)
      .stroke('#808080')
      .moveTo(140, 115)
      .lineTo(490, 115)
      .stroke('#808080')
      .moveTo(140, 116)
      .lineTo(490, 116)
      .stroke('#808080')
      .moveTo(140, 117)
      .lineTo(490, 117)
      .stroke('#808080')
      .moveTo(140, 118)
      .lineTo(490, 118)
      .stroke('#808080')
      .moveTo(140, 119)
      .lineTo(490, 119)
      .stroke('#808080')
      .moveTo(140, 120)
      .lineTo(490, 120)
      .stroke('#808080')
      .font('fonts/Calibri Bold.ttf')
      .fontSize(7)
      .fillColor('white')
      .text('12.06.2023', 280, 112);

    doc
      .font('fonts/Calibri.ttf')
      .fillColor('#383131')
      .fontSize(9)
      .text('Employee: ', 150, 140, {
        lineBreak: true,
        continued: true,
      })
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text(req.query.employee)
      .moveTo(150, 150)
      .lineTo(290, 150)
      .stroke('#544545');

    // doc
    //   .font('fonts/Calibri.ttf')
    //   .fontSize(9)
    //   .text('Position: ', 150, 155, {
    //     lineBreak: true,
    //     continued: true,
    //   })
    //   .font('fonts/Calibri.ttf')
    //   .fontSize(8)
    //   .text('Chief Executive Officer')
    //   .moveTo(150, 165)
    //   .lineTo(290, 165)
    //   .stroke('#544545');

    doc
      .font('fonts/Calibri Bold.ttf')
      .fontSize(8)
      .text('GROSS INCOME', 290, 190);

    doc.font('fonts/Calibri.ttf').fontSize(8).text('Date of work', 150, 200);

    doc
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text('Total Hours Worked', 150, 210);

    doc
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text(req.query.dateofwork, 440, 200, {
        width: 40,
        align: 'right',
        lineBreak: false,
      });

    doc
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text(req.query.hoursWorked + ' hours ', 440, 210, {
        width: 40,
        align: 'right',
      });

    doc.font('fonts/Calibri.ttf').fontSize(8).text('Total', 390, 350);

    doc.font('fonts/Calibri.ttf').fontSize(8).text(req.query.total, 410, 350, {
      width: 60,
      align: 'right',
    });

    doc.font('fonts/Calibri Bold.ttf').fontSize(8).text('NET PAY', 380, 370);

    doc.font('fonts/Calibri.ttf').fontSize(8).text(req.query.total, 410, 370, {
      width: 60,
      align: 'right',
    });

    doc
      .font('fonts/Calibri.ttf')
      .fontSize(9)
      .text('Received by: ', 150, 410, {
        lineBreak: true,
        continued: true,
      })
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text('')
      .moveTo(150, 420)
      .lineTo(290, 420)
      .stroke('#544545');

    doc
      .font('fonts/Calibri.ttf')
      .fontSize(9)
      .text('Approved by: ', 350, 410, {
        lineBreak: true,
        continued: true,
      })
      .font('fonts/Calibri.ttf')
      .fontSize(8)
      .text('')
      .moveTo(350, 420)
      .lineTo(470, 420)
      .stroke('#544545');

    doc.rect(140, 40, 350, doc.y).stroke('#544545');

    doc.end();
    let filepath = path.join(
      __dirname + './payslips/' + req.query.employee + '_payslip.pdf'
    );

    // res.download(filepath);
  }
  // else {
  //   console.log('Error ' + req.body.employee);
  //   res.send('Could not generate payslip. API Error');
  // }
});

app.all('/employeeRecord', (req, res) => {
  mongoose.connect(client);
  if (req.method === 'POST') {
    const empRecord = mongoose.model('employeeRecord', employeeRecord);
    const addRecord = new empRecord({
      id: req.body._id,
      hoursWorked: req.body.hoursWorked,
      date: req.body.date,
      total: req.body.total,
      employeeName: req.body.employeeName,
      category: req.body.category,
      salary: req.body.salary,
    });
    addRecord.save().then(() => {
      res.send('Record saved successfully!!!');
      console.log(req.body.employeeName + ' Saved Successfully');
    });
  }
  if (req.method === 'GET') {
    const recordData = [];
    const RecordModel = mongoose.model('employeeRecord', employeeRecord);
    const recordfunc = async () => {
      await RecordModel.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          recordData.push(r[i]);
        }
      });
      res.send(recordData);
    };
    recordfunc();
  }
});

app.all('/wages', (req, res) => {
  mongoose.connect(client);
  if (req.method === 'POST') {
    console.log(req.body);
    const WageModel = mongoose.model('Wage', wage);
    const addWage = new WageModel({
      classificationType: req.body.classificationType,
      trade: req.body.trade,
      regularTime: req.body.regularTime,
      doubleTime: req.body.doubleTime,
      overTime: req.body.overTime,
      toDate: req.body.toDate,
      fromDate: req.body.fromDate,
      date: new Date(),
    });
    addWage
      .save()
      .then(() => {
        res.send(
          req.body.trade +
            ' ' +
            req.body.classificationType +
            ' saved Successfully'
        );
        res.send('Saved Successfully!!!');
      })
      .catch((err) => {
        res.send(err);
      });
  } else if (req.method === 'GET') {
    const wageData = [];
    const WageModel = mongoose.model('Wages', wage);
    const func = async () => {
      await WageModel.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          wageData.push(r[i]);
        }
      });
      res.send(wageData);
    };
    func();
  }
});

app.all('/contractors', (req, res) => {
  mongoose.connect(client);
  const ContractorModel = mongoose.model('Contractor', contractors);
  if (req.method === 'POST') {
    const addContractor = new ContractorModel({
      contractorName: req.body.contractorname,
    });
    addContractor.save().then((r) => {
      res.send('Contractor added to database');
      console.log(req.body + ' saved succesfully');
    });
  } else if (req.method === 'GET') {
    const contracdata = [];
    const ContractorModal = mongoose.model('Contractor', contractors);
    const func = async () => {
      await ContractorModal.find({}, { _id: 0, contractorName: 1 }).then(
        (r) => {
          for (let i = 0; i < r.length; i++) {
            contracdata.push(r[i]);
          }
        }
      );
      res.send(contracdata);
    };
    func();
  }
});

app.all('/classification', (req, res) => {
  mongoose.connect(client);
  const ClassificationModel = mongoose.model('Classification', classification);
  if (req.method === 'POST') {
    const addClassification = new ClassificationModel({
      unionAffiliation: req.body.unionAffiliation,
      classificationType: req.body.classificationType,
    });
    addClassification.save().then(() => {
      res.send(req.body.classificationType + ' saved Successfully!!');
    });
  }
  if (req.method === 'GET') {
    const data = [];
    const func = async () => {
      await ClassificationModel.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          data.push(r[i]);
        }
      });
      res.send(data);
    };
    func();
  }
});

app.all('/projects', (req, res) => {
  mongoose.connect(client);
  if (req.method === 'POST') {
    const project = mongoose.model('Project', projects);
    const addProject = new project({
      code: req.body.code,
      name: req.body.name,
      address: req.body.address,
      dateofwork: req.body.dateofWork,
      description: req.body.description,
      assignedProjectManager: req.body.assignedEmployee,
    });
    addProject.save().then(() => {
      res.send('Data added to database');
      console.log(req.body + ' added successfully!!');
    });
  } else if (req.method === 'GET') {
    const projectData = [];
    const ProjectModal = mongoose.model('Project', projects);
    const func = async () => {
      await ProjectModal.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          projectData.push(r[i]);
        }
      });
      res.send(projectData);
    };
    func();
  }
});

app.all('/trade', (req, res) => {
  mongoose.connect(client);
  if (req.method === 'POST') {
    const TradeModel = mongoose.model('Trade', trade);
    const addTrade = new TradeModel({
      trade: req.body.trade,
    });
    addTrade.save().then(() => {
      res.send(req.body.trade + ' saved Successfully!!');
    });
  }
  if (req.method === 'GET') {
    const tradeData = [];
    const TradeModel = mongoose.model('Trade', trade);
    const func = async () => {
      await TradeModel.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          const arr = r[i].trade;
          arr.map((i) => {
            tradeData.push(i);
          });
        }
      });
      res.json(tradeData);
    };
    func();
  }
});

app.get('/classificationonly', (req, res) => {
  const data = [];
  mongoose.connect(client);
  const classi = mongoose.model('Classification', classification);
  classi
    .find({}, { _id: 1, classificationType: 1, unionAffiliation: 1 })
    .then((r) => {
      res.send(r);
    });
});

app.get('/employeesonly', (req, res) => {
  mongoose.connect(client);
  const employeeonly = mongoose.model('Users', user);
  employeeonly
    .find({}, { _id: 1, firstName: 1, lastName: 1, employeeType: 1 })
    .then((r) => {
      res.send(r);
    });
});

app.get('/contractorsonly', (req, res) => {
  mongoose.connect(client);
  const contractor = mongoose.model('Contractors', contractors);
  contractor
    .find(
      {},
      { _id: 1, contractorName: 1, contractorTrade: 1, contractorType: 1 }
    )
    .then((r) => {
      res.send(r);
    });
});

app.get('/projectsonly', (req, res) => {
  mongoose.connect(client);
  const projectsonly = mongoose.model('Projects', projects);
  projectsonly.find({}, { _id: 1, name: 1, code: 1 }).then((r) => {
    res.send(r);
  });
});

app.get('/tradeonly', (req, res) => {
  mongoose.connect(client);
  const TradeModel = mongoose.model('Trade', trade);

  TradeModel.find({}, { _id: 0, trade: 1 }).then((r) => {
    res.send(r);
  });
});

app.all('/employees', (req, res, next) => {
  if (req.method === 'POST') {
    mongoose.connect(client);
    const UserModel = mongoose.model('User', user);

    // if (req.body.selectedOption === 'Admin') {
    const addUser = new UserModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      employeeType: req.body.employeeType,
      address: req.body.address,
      salary: req.body.salary,
      // dob: req.body.dob,
      gender: req.body.gender,
      emergencyContact: req.body.emergencyContact,
      employeeCertification: req.body.employeeCertification,
      phoneNumber: req.body.phoneNumber,
      compnayName: req.body.compnayName ? req.body.compnayName : '',
      companyAddress: req.body.array,
    });
    addUser.save().then(() => {
      res.send('Successfully Saved to Database!!');
      console.log(
        req.body.firstName + ' ' + req.body.lastName + ' saved Successfully!!'
      );
      console.log(req.body);
    });
  } else if (req.method === 'GET') {
    const employeeData = [];
    const UserModel = mongoose.model('User', user);
    const func = async () => {
      await UserModel.find({}).then((r) => {
        for (let i = 0; i < r.length; i++) {
          employeeData.push(r[i]);
        }
      });
      res.json(employeeData);
    };
    func();
  }
});

app.get('/delete/projects', (req, res) => {
  mongoose.connect(client);
  const projectModel = mongoose.model('Project', projects);
  projectModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
  console.log(req.query.id + 'deleted from server');
});
app.get('/delete/contractors', (req, res) => {
  mongoose.connect(client);
  const contractorModel = mongoose.model('Contractors', contractors);
  contractorModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
  console.log(req.query.id + 'deleted from server');
});
app.get('/delete/classification', (req, res) => {
  mongoose.connect(client);
  const classificationModel = mongoose.model('Classification', classification);
  classificationModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
  console.log(req.query.id + 'deleted from server');
});
app.get('/delete/employees', (req, res) => {
  mongoose.connect(client);
  const employeeModel = mongoose.model('User', user);
  employeeModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
  console.log(req.query.id + 'deleted from server');
});
app.get('/delete/wages', (req, res) => {
  mongoose.connect(client);
  const wageModel = mongoose.model('Wage', wage);
  wageModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
  console.log(req.query.id + 'deleted from server');
});

app.post('/update/projects', (req, res) => {
  mongoose.connect(client);
  const projectModel = mongoose.model('Project', projects);
  projectModel
    .updateOne({ _id: req.query.id }, [
      {
        $set: {
          code: req.body.code,
          name: req.body.name,
          address: req.body.address,
          description: req.body.description,
          ntpDate: req.body.ntpDate,
          scDate: req.body.scDate,
          fcDate: req.body.fcDate,
          awardDate: req.body.awardDate,
          primeContractors: req.body.primeContractors,
          subContractors: req.body.subContractors,
          assignedProjectManager: req.body.assignedProjectManager,
          assignedProjectSupervisor: req.body.assignedProjectSupervisor,
        },
      },
    ])
    .then(() => {
      res.send('Updated ' + req.query.id);
    });
});
app.post('/update/contractors', (req, res) => {
  mongoose.connect(client);
  const contractorModel = mongoose.model('Contractors', contractors);
  contractorModel
    .updateOne({ _id: req.query.id }, [
      {
        $set: {
          contractorName: req.body.contractorname,
          contractorAddress: req.body.contractoraddress,
          contractorType: req.body.contractortype,
          contractorTrade: req.body.contractortrade,
          assignedProject: req.body.assignedproject,
          cpi: req.body.cpi,
        },
      },
    ])
    .then(() => {
      res.send('Updated ' + req.query.id);
    });
});
app.get('/update/classification', (req, res) => {
  mongoose.connect(client);
  const classificationModel = mongoose.model('Classification', classification);
  classificationModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
});
app.post('/update/employees', (req, res) => {
  mongoose.connect(client);
  const employeeModel = mongoose.model('User', user);
  employeeModel
    .updateOne({ _id: req.query.id }, [
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          employeeType: req.body.employeeType,
          address: req.body.address,
          salary: req.body.salary,
          gender: req.body.gender,
          emergencyContact: req.body.emergencyContact,
          employeeCertification: req.body.employeeCertification,
          phoneNumber: req.body.phoneNumber,
          compnayName: req.body.compnayName ? req.body.compnayName : '',
          companyAddress: req.body.array,
        },
      },
    ])
    .then((e) => {
      res.send('Employee updated successfully!!');
    });
});
app.get('/update/wages', (req, res) => {
  mongoose.connect(client);
  const wageModel = mongoose.model('Wage', wage);
  wageModel.deleteOne({ _id: req.query.id }).then(() => {
    res.send('Deleted ' + req.query.id);
  });
});

app.listen(cfg.port, () => {
  console.log(`Example app listening at http://localhost:${cfg.port}`);
});

app.all('companyprofile', (req, res) => {});

app.all('/setPermissions', (req, res) => {
  if (req.method == 'POST') {
  }
});

export { cfg, app };
