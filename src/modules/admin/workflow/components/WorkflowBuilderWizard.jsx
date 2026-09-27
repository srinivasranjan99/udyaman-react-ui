import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box, Typography, Button, Stepper, Step, StepLabel, Grid, 
  Paper, List, IconButton, Divider, Stack,
  ListItemText, ListItemSecondaryAction, Chip, Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { 
  TextInput, 
  NumberInput, 
  SelectInput, 
  AutocompleteInput 
} from '../../../../components/forms/UdyamanFormFields';

const steps = ['Module Configuration', 'Rule Conditions', 'Approval Levels'];

const WorkflowBuilderWizard = ({ onSave, onCancel, roles = [], initialData = null }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Map initialData from Entity structure back to Wizard flat structure
  const getDefaults = () => {
    if (!initialData) return {
      module: 'PURCHASE_ORDER',
      policyName: '',
      conditionType: 'AMOUNT',
      operator: '>',
      value: '0',
      priority: 1,
      steps: [{ levelOrder: 1, approverType: 'ROLE', approverValue: '' }]
    };

    const rule = initialData.rules?.[0] || {};
    return {
      module: initialData.module,
      policyName: initialData.name,
      conditionType: rule.conditionType || 'AMOUNT',
      operator: rule.operator || '>',
      value: rule.ruleValue || '0',
      priority: rule.priority || 1,
      steps: rule.steps?.length > 0 ? rule.steps.map(s => ({
        levelOrder: s.levelOrder,
        approverType: s.approverType,
        approverValue: s.approverValue
      })) : [{ levelOrder: 1, approverType: 'ROLE', approverValue: '' }]
    };
  };

  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    defaultValues: getDefaults()
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps"
  });

  const watchedValues = watch();

  const handleNext = async () => {
    const fieldsToValidate = activeStep === 0 ? ["module", "policyName"] : ["conditionType", "value", "priority"];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = (data) => {
    const payload = {
      name: data.policyName,
      module: data.module,
      rules: [
        {
          conditionType: data.conditionType,
          operator: data.operator,
          ruleValue: String(data.value),
          priority: data.priority,
          steps: data.steps
        }
      ]
    };
    onSave(payload);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SelectInput 
                name="module" 
                control={control} 
                label="Target Module" 
                required
                options={[
                  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
                  { value: 'INVOICE', label: 'Vendor Invoice' },
                  { value: 'EXPENSE', label: 'Employee Expense' }
                ]}
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput name="policyName" control={control} label="Policy Name" placeholder="e.g., High Value PO Approval" required />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <SelectInput 
                name="conditionType" 
                control={control} 
                label="Trigger Condition" 
                options={[
                  { value: 'AMOUNT', label: 'Transaction Amount' },
                  { value: 'ALWAYS', label: 'Always Apply' }
                ]}
              />
            </Grid>
            {watchedValues.conditionType === 'AMOUNT' && (
              <>
                <Grid item xs={12} md={4}>
                  <SelectInput 
                    name="operator" 
                    control={control} 
                    label="Operator" 
                    options={[
                      { value: '>', label: 'Greater Than (>)' },
                      { value: '>=', label: 'Greater or Equal (>=)' },
                      { value: '=', label: 'Equal To (=)' },
                      { value: '<', label: 'Less Than (<)' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput name="value" control={control} label="Threshold Value" required />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <NumberInput name="priority" control={control} label="Rule Priority" helperText="Higher numbers take precedence if multiple rules match." />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Define Approvers Sequence</Typography>
              <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => append({ levelOrder: fields.length + 1, approverType: 'ROLE', approverValue: '' })}>
                Add Level
              </Button>
            </Box>
            <List>
              {fields.map((field, index) => (
                <Paper variant="outlined" key={field.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: '2px solid #e2e8f0' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={1}>
                      <Typography variant="h6" color="primary" fontWeight="bold">{index + 1}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <SelectInput 
                        name={`steps.${index}.approverType`} 
                        control={control} 
                        label="Type" 
                        options={[{ value: 'ROLE', label: 'Role Based' }, { value: 'USER', label: 'Specific User' }]}
                        sx={{ mt: 0 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      {watchedValues.steps[index]?.approverType === 'ROLE' ? (
                        <AutocompleteInput 
                          name={`steps.${index}.approverValue`} 
                          control={control} 
                          label="Select Role" 
                          options={roles.map(r => ({ value: r, label: r }))}
                          sx={{ mt: 0 }}
                        />
                      ) : (
                        <TextInput name={`steps.${index}.approverValue`} control={control} label="User ID / Name" sx={{ mt: 0 }} />
                      )}
                    </Grid>
                    <Grid item xs={2} align="right">
                      <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </List>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 300, mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Preview Section */}
      <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="body2" fontWeight="bold">Workflow Preview:</Typography>
        <Typography variant="body2">
          If <strong>{watchedValues.module}</strong> {watchedValues.conditionType === 'AMOUNT' ? `Amount ${watchedValues.operator} ${watchedValues.value}` : 'is created'} 
          {" → "} 
          {watchedValues.steps.map((s, i) => (
            <span key={i}>
              <Chip label={s.approverValue || '...'} size="small" sx={{ mx: 0.5, fontWeight: 'bold' }} />
              {i < watchedValues.steps.length - 1 ? ' → ' : ''}
            </span>
          ))}
        </Typography>
      </Alert>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<PrevIcon />}>
          Back
        </Button>
        <Stack direction="row" spacing={2}>
          <Button onClick={onCancel}>Cancel</Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)} startIcon={<SaveIcon />}>
              {initialData ? 'Update Workflow' : 'Save Workflow'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} endIcon={<NextIcon />}>
              Next Step
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default WorkflowBuilderWizard;
